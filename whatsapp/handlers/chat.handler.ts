import * as baileys from "@whiskeysockets/baileys";
import ChatModel, { type IChatModel } from "../../models/whatsapp/ChatModel.js";
import type { BaileysEventHandler } from "../../types/baileys.js";
import { logger } from "../../utils/logger.js";
import type { IHandler } from "../contracts/IHandler.js";

export default class ChatHandler implements IHandler {
	private listening = false;
	constructor(
		private readonly sessionId: string,
		private readonly event: baileys.BaileysEventEmitter
	) {}

	async bulkWrite(chats: baileys.Chat[]) {
		try {
			const processedChats = chats.map((chat) => {
				return {
					chatId: chat.id,
					sessionId: this.sessionId,
					...chat,
					meta: chat,
				} as Omit<IChatModel, "_id">;
			});
			await ChatModel.bulkWrite(
				processedChats.map((chat) => ({
					updateOne: {
						filter: { chatId: chat.chatId, sessionId: this.sessionId },
						update: { $set: chat },
						upsert: true,
					},
				}))
			);
		} catch (e) {
			logger.error(e, "An error occurred during chat handler");
		}
	}

	set: BaileysEventHandler<"messaging-history.set"> = async ({
		chats,
		isLatest,
	}) => {
		try {
			if (isLatest) await ChatModel.deleteMany({ sessionId: this.sessionId });
			await this.bulkWrite(chats);
		} catch (error) {
			logger.error(error, "An error occurred during chat handler");
		}
	};

	upsert: BaileysEventHandler<"chats.upsert"> = async (chats) => {
		await this.bulkWrite(chats);
	};

	update: BaileysEventHandler<"chats.update"> = async (updates) => {
		await this.bulkWrite(updates as baileys.Chat[]);
	};

	listen(): void {
		if (this.listening) return;
		this.listening = true;
		this.event.on("chats.upsert", this.upsert);
		this.event.on("chats.update", this.update);
		this.event.on("messaging-history.set", this.set);
	}

	unlisten(): void {
		if (!this.listening) return;
		this.listening = false;
		this.event.off("chats.upsert", this.upsert);
		this.event.off("chats.update", this.update);
		this.event.off("messaging-history.set", this.set);
	}
}
