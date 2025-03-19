import type { BaileysEventEmitter } from "@whiskeysockets/baileys";
import ChatHandler from "./handlers/chat.handler.js";
import ContactHandler from "./handlers/contact.handler.js";
import { GroupMetaDataHandler } from "./handlers/group-meta-data.handler.js";
import MessageHandler from "./handlers/message.handler.js";

export class Store {
	private readonly contactHandler: ContactHandler;
	private readonly chatHandler: ChatHandler;
	private readonly groupMetaDataHandler: GroupMetaDataHandler;
	private readonly messageHandler: MessageHandler;

	constructor(sessionId: string, event: BaileysEventEmitter) {
		this.contactHandler = new ContactHandler(sessionId, event);
		this.chatHandler = new ChatHandler(sessionId, event);
		this.groupMetaDataHandler = new GroupMetaDataHandler(sessionId, event);
		this.messageHandler = new MessageHandler(sessionId, event);

		this.listen();
	}

	public listen() {
		this.contactHandler.listen();
		this.chatHandler.listen();
		this.groupMetaDataHandler.listen();
		this.messageHandler.listen();
	}

	public unlisten() {
		this.contactHandler.unlisten();
		this.chatHandler.unlisten();
		this.groupMetaDataHandler.unlisten();
		this.messageHandler.unlisten();
	}

	public getMessageHandler(): MessageHandler {
		return this.messageHandler;
	}
}
