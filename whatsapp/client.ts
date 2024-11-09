import {
	DisconnectReason,
	isJidBroadcast,
	makeCacheableSignalKeyStore,
	makeWASocket,
	type ConnectionState,
	type WASocket,
} from "@whiskeysockets/baileys";
import WhatsappAuthState from "../models/whatsapp/WhatsappAuthState.js";
import { WAStatus } from "../types/status-connection.js";
import { logger } from "../utils/logger.js";
import { initSession } from "./auth-session.js";
import { Store } from "./store.js";

export type Session = WASocket & {
	destroy: () => Promise<void>;
	store: Store;
	waStatus?: WAStatus;
};

type SessionId = string;

export default class WhatsappClient {
	static readonly MAX_RECONNECT_RETRIES = 5;
	static readonly RECONNECT_INTERVAL = 1000;
	private static readonly sessions = new Map<SessionId, Session>();
	private static retries = new Map<SessionId, number>();

	static async init() {
		const storedSession = await WhatsappAuthState.distinct("sessionId");
		for (const sessionId of storedSession) {
			await WhatsappClient.createSession(sessionId);
		}
	}

	private static updateWaConnection(sessionId: string, waStatus: WAStatus) {
		if (this.sessions.has(sessionId)) {
			const _session = this.sessions.get(sessionId)!;
			this.sessions.set(sessionId, { ..._session, waStatus });
		}
	}

	private static shouldReconnect(sessionId: string) {
		let attempts = this.retries.get(sessionId) ?? 0;

		if (attempts < this.MAX_RECONNECT_RETRIES) {
			attempts += 1;
			this.retries.set(sessionId, attempts);
			return true;
		}
		return false;
	}

	static async createSession(sessionId: string) {
		let connectionState: Partial<ConnectionState> = { connection: "close" };

		const destroy = async (logout = true) => {
			try {
				await Promise.all([
					logout && socket.logout(),
					WhatsappAuthState.deleteMany({
						sessionId,
					}),
				]);
				console.info({ session: sessionId }, "Session destroyed");
			} catch (e) {
				console.error(e, "An error occurred during session destroy");
			} finally {
				this.sessions.get(sessionId)?.store.unlisten();
				this.sessions.delete(sessionId);
				this.updateWaConnection(sessionId, WAStatus.Disconected);
			}
		};

		const handleConnectionClose = () => {
			const code = (connectionState.lastDisconnect?.error as any)?.output
				?.statusCode;
			const restartRequired = code === DisconnectReason.restartRequired;
			const doNotReconnect = !this.shouldReconnect(sessionId);

			this.updateWaConnection(sessionId, WAStatus.Disconected);

			if (code === DisconnectReason.loggedOut || doNotReconnect) {
				destroy(doNotReconnect);
				return;
			}

			console.log(restartRequired, "restar recored");

			// if (!restartRequired) {
			// 	console.info(
			// 		{ attempts: this.retries.get(sessionId) ?? 1, sessionId },
			// 		"Reconnecting..."
			// 	);
			// }
			// console.log(restartRequired, "ok");
			setTimeout(
				() => this.createSession(sessionId),
				restartRequired ? 0 : this.RECONNECT_INTERVAL
			);
		};

		const { saveCreds, state } = await initSession(sessionId);

		const socket = makeWASocket({
			auth: {
				creds: state.creds,
				// @ts-ignore
				keys: makeCacheableSignalKeyStore(state.keys, logger),
			},
			shouldIgnoreJid: (jid) => isJidBroadcast(jid),
			// @ts-ignore
			logger,
			generateHighQualityLinkPreview: true,
		});

		const store = new Store(sessionId, socket.ev);

		this.sessions.set(sessionId, {
			...socket,
			waStatus: WAStatus.Unknown,
			store,
			destroy,
		});

		socket.ev.on("creds.update", saveCreds);
		socket.ev.on("connection.update", (update) => {
			connectionState = update;
			const { connection } = update;

			if (connection === "open") {
				this.updateWaConnection(
					sessionId,
					update.isNewLogin ? WAStatus.Authenticated : WAStatus.Connected
				);
				this.retries.delete(sessionId);
			}
			if (connection === "close") handleConnectionClose();
			if (connection === "connecting")
				this.updateWaConnection(sessionId, WAStatus.Connecting);
		});
	}

	static getSessionStatus(session: Session) {
		const state = ["CONNECTING", "CONNECTED", "DISCONNECTING", "DISCONNECTED"];
		let status = state[(session.ws as any).readyState];
		status = session.user ? "AUTHENTICATED" : status;
		return session.waStatus !== WAStatus.Unknown
			? session.waStatus
			: status.toLowerCase();
	}

	static listSessions() {
		return Array.from(this.sessions.entries()).map(([id, session]) => ({
			id,
			status: this.getSessionStatus(session),
		}));
	}

	static getSession(sessionId: string) {
		return this.sessions.get(sessionId);
	}

	static async deleteSession(sessionId: string) {
		this.sessions.get(sessionId)?.destroy();
	}

	static sessionExists(sessionId: string) {
		return this.sessions.has(sessionId);
	}
}
