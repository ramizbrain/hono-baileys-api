import mongoose, { model, Schema } from "mongoose";
import { z } from "zod";

export const ContactModelSchema = z.object({
	_id: z.custom<Schema.Types.ObjectId>(),
	jid: z.string(),
	name: z.string().optional(),
	verifiedName: z.string().optional(),
	sessionId: z.string(),
});

export type IContactModel = z.infer<typeof ContactModelSchema>;

const schema = new Schema<IContactModel>({
	_id: { type: Schema.Types.ObjectId, required: true },
	jid: { type: String, required: true },
	name: { type: String, required: false },
	verifiedName: { type: String, required: false },
	sessionId: { type: String, required: true },
});

export const ContactModelModelName = "ContactModel";

export default mongoose.models[ContactModelModelName] ||
	model<IContactModel>(ContactModelModelName, schema);
