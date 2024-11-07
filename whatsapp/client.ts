import {
	DisconnectReason,
	isJidBroadcast,
	makeCacheableSignalKeyStore,
	makeWASocket,
	type ConnectionState,
	type WASocket,
} from "@whiskeysockets/baileys";
import Session from "../models/Session.js";
import { WAStatus } from "../types/status-connection.js";
import { logger } from "../utils/logger.js";
import { initSession } from "./auth-session.js";

export type Session = WASocket & {
	destroy: () => Promise<void>;
	waStatus?: WAStatus;
};

type SessionId = string;

export default class WhatsappClient {
	static readonly MAX_RECONNECT_RETRIES = 5;
	static readonly RECONNECT_INTERVAL = 1000;
	private static readonly sessions = new Map<SessionId, Session>();
	private static retries = new Map<SessionId, number>();
	constructor() {
		this.init();
	}

	private async init() {
		const storedSession = await Session.find();
		for (const session of storedSession) {
			await WhatsappClient.createSession(session._id.toString());
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
				await Promise.all([logout && socket.logout()]);
				console.info({ session: sessionId }, "Session destroyed");
			} catch (e) {
				console.error(e, "An error occurred during session destroy");
			} finally {
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

			if (!restartRequired) {
				console.info(
					{ attempts: this.retries.get(sessionId) ?? 1, sessionId },
					"Reconnecting..."
				);
			}
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

		this.sessions.set(sessionId, {
			...socket,
			waStatus: WAStatus.Unknown,
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
				this.updateWaConnection(sessionId, WAStatus.PullingWAData);
		});
	}
}
