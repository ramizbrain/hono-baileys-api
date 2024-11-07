import mongoose, { Schema } from "mongoose";
import { z } from "zod";

export const sessionSchema = z.object({
	_id: z.custom<Schema.Types.ObjectId>(),
	name: z.string().min(1),
	whatsapp: z.object({
		number: z.string(),
		name: z.string(),
		isConnected: z.boolean().default(false),
	}),

	createdAt: z.date(),
});

export type IDevice = z.infer<typeof sessionSchema>;

const schema = new Schema<IDevice>({
	name: { type: String, required: true },
	whatsapp: {
		number: { type: String, required: true },
		name: { type: String, required: true },
		isConnected: { type: Boolean, required: true, default: false },
	},
	createdAt: { type: Date, required: true, default: Date.now },
});

schema.path("name").required(true, "name is required");
schema.path("whatsapp.number").required(true, "whatsapp.number is required");
schema.path("whatsapp.name").required(true, "whatsapp.name is required");
schema.path("createdAt").required(true, "createdAt is required");

export const sessionModelName = "WhatsappSession";

export default mongoose.model<IDevice>(sessionModelName, schema);
