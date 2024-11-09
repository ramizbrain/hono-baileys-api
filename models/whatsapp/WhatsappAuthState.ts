import mongoose, { model, Schema, type Model } from "mongoose";
import { z } from "zod";

export const WhatsappAuthStateSchema = z.object({
	_id: z.custom<Schema.Types.ObjectId>(),
	type: z.string(),
	data: z.string(),
	sessionId: z.string(),
});

export type IWhatsappAuthState = z.infer<typeof WhatsappAuthStateSchema>;

const schema = new Schema<IWhatsappAuthState>({
	type: { type: String, required: true },
	data: { type: String, required: true },
	sessionId: {
		type: String,
		required: true,
	},
});

export const WhatsappAuthStateModelName = "WhatsappAuthState";

export default (mongoose.models[WhatsappAuthStateModelName] ||
	model<IWhatsappAuthState>(
		WhatsappAuthStateModelName,
		schema
	)) as Model<IWhatsappAuthState>;
