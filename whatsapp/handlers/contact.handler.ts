import * as baileys from "@whiskeysockets/baileys";
import ContactModel, {
	type IContactModel,
} from "../../models/whatsapp/ContactModel.js";
import type { IGroupMetaData } from "../../models/whatsapp/GroupMetaDataModel.js";
import GroupMetaDataModel from "../../models/whatsapp/GroupMetaDataModel.js";
import type { BaileysEventHandler } from "../../types/baileys.js";
import type { IHandler } from "../contracts/ihandler.js";

export default class ContactHandler implements IHandler {
	private listening = false;
	constructor(
		private readonly sessionId: string,
		private readonly event: baileys.BaileysEventEmitter
	) {}

	async bulkWrite(contacts: Partial<baileys.Contact>[]) {
		try {
			const processedContacts: Omit<IContactModel, "_id">[] = [];
			const processedGroups: Omit<IGroupMetaData, "_id">[] = [];

			await Promise.all(
				contacts.map(async (contact) => {
					const jid = baileys.jidNormalizedUser(contact?.id);
					if (baileys.isJidUser(jid)) {
						processedContacts.push({
							jid: baileys.jidNormalizedUser(contact?.id),
							sessionId: this.sessionId,
							name: contact?.name,
							verifiedName: contact?.verifiedName,
						});
					} else if (baileys.isJidGroup(jid)) {
						const metadata: IGroupMetaData | null =
							await GroupMetaDataModel.findOne({
								sessionId: this.sessionId,
								chatId: jid,
							});
						processedGroups.push({
							chatId: jid,
							sessionId: this.sessionId,
							subject: contact?.name || metadata?.subject || "",
							participants: metadata?.participants || [],
						});
					}
				})
			);

			await ContactModel.bulkWrite(
				processedContacts.map((contact) => ({
					updateOne: {
						filter: { jid: contact.jid, sessionId: this.sessionId },
						update: { $set: contact },
						upsert: true,
					},
				}))
			);

			await GroupMetaDataModel.bulkWrite(
				processedGroups.map((group) => ({
					updateOne: {
						filter: { chatId: group.chatId, sessionId: this.sessionId },
						update: { $set: group },
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
