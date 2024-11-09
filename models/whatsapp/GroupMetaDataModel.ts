import mongoose, { model, Schema } from "mongoose";
import z from "zod";

export const GroupParticipantSchema = z.object({
	jid: z.string(),
	isAdmin: z.boolean(),
});

export const GroupMetaDataSchema = z
	.object({
		_id: z.custom<Schema.Types.ObjectId>(),
		chatId: z.string(),
		sessionId: z.string(),
		subject: z.string(),
		participants: z
			.object({
				id: z.string(),
				lid: z.string().optional(),
				name: z.string().optional(),
				notify: z.string().optional(),
				verifiedName: z.string().optional(),
				imgUrl: z.string().optional(),
				status: z.string().optional(),
				isAdmin: z.boolean().default(false),
				isSuperAdmin: z.boolean().default(false),
				admin: z.enum(["admin", "superadmin"]).optional(),
			})
			.array()
			.default([]),
	})
	.merge(
		z
			.object({
				owner: z.string(),
				subjectOwner: z.string(),
				subjectTime: z.number(),
				creation: z.number(),

				desc: z.string(),
				descOwner: z.string(),
				descId: z.string(),

				/** if this group is part of a community, it returns the jid of the community to which it belongs */
				linkedParent: z.string(),
				/** is set when the group only allows admins to change group settings */
				restrict: z.boolean(),
				/** is set when the group only allows admins to write messages */
				announce: z.boolean(),
				/** is set when the group also allows members to add participants */
				memberAddMode: z.boolean(),
				/** Request approval to join the group */
				joinApprovalMode: z.boolean(),
				/** is this a community */
				isCommunity: z.boolean(),
				/** is this the announce of a community */
				isCommunityAnnounce: z.boolean(),
				/** number of group participants */
				size: z.number(),
				ephemeralDuration: z.number(),
				inviteCode: z.string(),
				/** the person who added you to group or changed some setting in group */
				author: z.string(),
			})
			.partial()
	);

export type IGroupMetaData = z.infer<typeof GroupMetaDataSchema>;

export const GroupMetaDataModelName = "GroupMetaData";

const schema = new Schema<IGroupMetaData>({
	_id: { type: Schema.Types.ObjectId, required: true },
	chatId: { type: String, required: true },
	sessionId: { type: String, required: true },
	subject: { type: String, required: false },
	participants: {
		type: [
			{
				id: String,
				lid: String,
				name: String,
				notify: String,
				verifiedName: String,
				imgUrl: String,
				status: String,
				isAdmin: Boolean,
				isSuperAdmin: Boolean,
				admin: String,
			},
		],
		required: false,
	},
	owner: { type: String, required: false },
	subjectOwner: { type: String, required: false },
	subjectTime: { type: Number, required: false },
	creation: { type: Number, required: false },
	desc: { type: String, required: false },
	descOwner: { type: String, required: false },
	descId: { type: String, required: false },
	linkedParent: { type: String, required: false },
	restrict: { type: Boolean, required: false },
	announce: { type: Boolean, required: false },
	memberAddMode: { type: Boolean, required: false },
	joinApprovalMode: { type: Boolean, required: false },
	isCommunity: { type: Boolean, required: false },
	isCommunityAnnounce: { type: Boolean, required: false },
	size: { type: Number, required: false },
	ephemeralDuration: { type: Number, required: false },
	inviteCode: { type: String, required: false },
	author: { type: String, required: false },
});

export default mongoose.models[GroupMetaDataModelName] ||
	model<IGroupMetaData>(GroupMetaDataModelName, schema);
