import { model, models, Schema, type Model } from "mongoose";
import { z } from "zod";
import { sessionModelName } from "../Session.js";

export const WhatsappAuthStateSchema = z.object({
	_id: z.custom<Schema.Types.ObjectId>(),
	type: z.string(),
	data: z.string(),
	sessionId: z.custom<Schema.Types.ObjectId>(),
});

export type IWhatsappAuthState = z.infer<typeof WhatsappAuthStateSchema>;

const schema = new Schema<IWhatsappAuthState>({
	type: { type: String, required: true },
	data: { type: String, required: true },
	sessionId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: sessionModelName,
	},
});

export const WhatsappAuthStateModelName = "WhatsappAuthState";

export default (models[WhatsappAuthStateModelName] ||
	model<IWhatsappAuthState>(
		WhatsappAuthStateModelName,
		schema
	)) as Model<IWhatsappAuthState>;
