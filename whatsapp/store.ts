import type { BaileysEventEmitter } from "@whiskeysockets/baileys";
import ContactHandler from "./handlers/contact.handler.js";

export class Store {
	private readonly contactHandler: ContactHandler;
	constructor(sessionId: string, event: BaileysEventEmitter) {
		this.contactHandler = new ContactHandler(sessionId, event);

		this.listen();
	}

	public listen() {
		this.contactHandler.listen();
	}

	public unlisten() {
		this.contactHandler.unlisten();
	}
}
