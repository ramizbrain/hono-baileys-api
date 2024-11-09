import type { BaileysEventEmitter } from "@whiskeysockets/baileys";
import ChatHandler from "./handlers/chat.handler.js";
import ContactHandler from "./handlers/contact.handler.js";

export class Store {
	private readonly contactHandler: ContactHandler;
	private readonly chatHandler: ChatHandler;
	constructor(sessionId: string, event: BaileysEventEmitter) {
		this.contactHandler = new ContactHandler(sessionId, event);
		this.chatHandler = new ChatHandler(sessionId, event);

		this.listen();
	}

	public listen() {
		this.contactHandler.listen();
		this.chatHandler.listen();
	}

	public unlisten() {
		this.contactHandler.unlisten();
		this.chatHandler.unlisten();
	}
}
