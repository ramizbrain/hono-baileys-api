import type { GroupMetadata } from "@whiskeysockets/baileys";
import GroupMetaDataModel, {
	type IGroupMetaData,
} from "../../models/whatsapp/GroupMetaDataModel.js";
import type { BaileysEventHandler } from "../../types/baileys.js";
import { logger } from "../../utils/logger.js";
import type { IHandler } from "../contracts/IHandler.js";

export class GroupMetaDataHandler implements IHandler {
	listening = false;
	constructor(
		private readonly sessionId: string,
		private readonly event: any
	) {}

	async bulkWrite(groups: Partial<GroupMetadata>[]) {
		try {
			const processedGroups = groups.map((group) => {
				return {
					chatId: group.id,
					sessionId: this.sessionId,
					...group,
				};
			});
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
			console.error(e, "An error occurred during group meta data handler");
		}
	}

	upsert: BaileysEventHandler<"groups.upsert"> = async (groups) => {
		await this.bulkWrite(groups);
	};

	update: BaileysEventHandler<"groups.update"> = async (updates) => {
		await this.bulkWrite(updates);
	};

	updateParticipants: BaileysEventHandler<"group-participants.update"> =
		async ({ action, id, participants }) => {
			try {
				const metadata: IGroupMetaData | null =
					await GroupMetaDataModel.findOne({
						chatId: id,
						sessionId: this.sessionId,
					});

				if (!metadata) {
					return logger.info(
						{ update: { id, action, participants } },
						"Got participants update for non existent group"
					);
				}

				if (!metadata.participants) {
					metadata.participants = [];
				}

				switch (action) {
					case "add":
						metadata.participants.push(
							...participants.map((id) => ({
								id: id,
								isAdmin: false,
								isSuperAdmin: false,
							}))
						);
						break;
					case "remove":
						metadata.participants = metadata.participants.filter(
							(participant) => !participants.includes(participant.id)
						);
						break;

					case "demote":
					case "promote":
						for (const participant of metadata.participants) {
							if (participants.includes(participant.id)) {
								participant.admin = action === "promote" ? "admin" : undefined;
								participant.isAdmin = action === "promote";
							}
						}
						break;
					default:
						break;
				}

				await GroupMetaDataModel.findOneAndUpdate(
					{ chatId: id, sessionId: this.sessionId },
					{ $set: metadata },
					{ upsert: true }
				);
			} catch (e) {
				logger.error(e, "An error occurred during group meta data handler");
			}
		};

	listen(): void {
		if (this.listening) return;
		this.listening = true;
		this.event.on("group-participants.update", this.updateParticipants);
		this.event.on("groups.update", this.update);
		this.event.on("groups.upsert", this.upsert);
	}

	unlisten(): void {
		if (!this.listening) return;
		this.listening = false;

		this.event.off("group-participants.update", this.updateParticipants);
		this.event.off("groups.update", this.update);
		this.event.off("groups.upsert", this.upsert);
	}
}
