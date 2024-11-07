import mongoose, { Schema } from "mongoose";
import { z } from "zod";
import { userModelName } from "./User.js";

export const deviceSchema = z.object({
	_id: z.custom<Schema.Types.ObjectId>(),
	name: z.string().min(1),
	whatsapp: z.object({
		number: z.string(),
		name: z.string(),
		isConnected: z.boolean().default(false),
	}),
	userId: z.custom<Schema.Types.ObjectId>(),
	createdAt: z.date(),
	isActive: z.boolean().default(false),
});
export type IDevice = z.infer<typeof deviceSchema>;

const schema = new Schema<IDevice>({
	name: { type: String, required: true },
	whatsapp: {
		number: { type: String, required: true },
		name: { type: String, required: true },
		isConnected: { type: Boolean, required: true, default: false },
	},

	isActive: { type: Boolean, required: true, default: false },
	createdAt: { type: Date, required: true, default: Date.now },

	userId: { type: Schema.Types.ObjectId, ref: userModelName, required: true },
});

schema.path("name").required(true, "name is required");
schema.path("whatsapp.number").required(true, "whatsapp.number is required");
schema.path("whatsapp.name").required(true, "whatsapp.name is required");
schema.path("userId").required(true, "userId is required");
schema.path("createdAt").required(true, "createdAt is required");

export const deviceModelName = "Device";

export default mongoose.model<IDevice>(deviceModelName, schema);
