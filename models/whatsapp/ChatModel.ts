import mongoose, { model, Schema } from "mongoose";
import { z } from "zod";

export const ChatModelSchema = z
	.object({
		_id: z.custom<Schema.Types.ObjectId>(),
		chatId: z.string(),
		sessionId: z.string(),
		meta: z.record(z.string(), z.any()),
	})

	// optional fields
	.merge(
		z
			.object({
				name: z.string(),
				displayName: z.string(),
				pinned: z.boolean().default(false),
				archived: z.boolean().default(false),
				description: z.string(),
				username: z.string(),
				commentsCount: z.number(),
				terminated: z.boolean(),
				suspended: z.boolean(),
				wallpaper: z.string(),
				notSpam: z.boolean(),
				readOnly: z.boolean(),
				unreadCount: z.number(),
			})
			.partial()
	);

export type IChatModel = z.infer<typeof ChatModelSchema>;

const schema = new Schema<IChatModel>({
	_id: { type: Schema.Types.ObjectId, required: true },
	chatId: { type: String, required: true },
	sessionId: { type: String, required: true },
	meta: { type: Object, required: false },
	name: { type: String, required: false },
	displayName: { type: String, required: false },
	pinned: { type: Boolean, required: false },
	archived: { type: Boolean, required: false },
	description: { type: String, required: false },
	username: { type: String, required: false },
	commentsCount: { type: Number, required: false },
	terminated: { type: Boolean, required: false },
	suspended: { type: Boolean, required: false },
	wallpaper: { type: String, required: false },
	notSpam: { type: Boolean, required: false },
	readOnly: { type: Boolean, required: false },
	unreadCount: { type: Number, required: false },
});

export const ChatModelModelName = "ChatModel";

export default mongoose.models[ChatModelModelName] ||
	model<IChatModel>(ChatModelModelName, schema);
