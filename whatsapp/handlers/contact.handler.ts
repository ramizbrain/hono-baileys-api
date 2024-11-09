import * as baileys from "@whiskeysockets/baileys";
import ContactModel from "../../models/whatsapp/ContactModel.js";
import type { BaileysEventHandler } from "../../types/baileys.js";
import type { IHandler } from "../contracts/IHandler.js";

export default class ContactHandler implements IHandler {
	private listening = false;
	constructor(
		private readonly sessionId: string,
		private readonly event: baileys.BaileysEventEmitter
	) {}

	async bulkWrite(contacts: Partial<baileys.Contact>[]) {
		try {
			const processedContacts = contacts.map((contact) => {
				return {
					jid: baileys.jidNormalizedUser(contact?.id),
					sessionId: this.sessionId,
					name: contact?.name,
					verifiedName: contact?.verifiedName,
				};
			});

			await ContactModel.bulkWrite(
				processedContacts.map((contact) => ({
					updateOne: {
						filter: { jid: contact.jid, sessionId: this.sessionId },
						update: { $set: contact },
						upsert: true,
					},
				}))
			);
		} catch (e) {
			console.error(e, "An error occurred during contact handler");
		}
	}

	set: BaileysEventHandler<"messaging-history.set"> = async ({ contacts }) => {
		await this.bulkWrite(contacts);
	};

	upsert: BaileysEventHandler<"contacts.upsert"> = async (contacts) => {
		await this.bulkWrite(contacts);
	};

	update: BaileysEventHandler<"contacts.update"> = async (updates) => {
		await this.bulkWrite(updates);
	};

	listen(): void {
		if (this.listening) return;
		this.listening = true;
		this.event.on("contacts.upsert", this.upsert);
		this.event.on("contacts.update", this.update);
		this.event.on("messaging-history.set", this.set);
	}

	unlisten(): void {
		if (!this.listening) return;
		this.listening = false;
		this.event.off("contacts.upsert", this.upsert);
		this.event.off("contacts.update", this.update);
		this.event.off("messaging-history.set", this.set);
	}
}
