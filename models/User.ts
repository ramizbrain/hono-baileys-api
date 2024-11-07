import { model, models, Schema, type Model } from "mongoose";
import { z } from "zod";

export const userRoleSchema = z.enum(["SUPER_ADMIN", "GENERAL"]);

export type ROLE_USER = z.infer<typeof userRoleSchema>;

export const userSchema = z.object({
	_id: z.custom<Schema.Types.ObjectId>(),
	phoneNumber: z.string(),
	password: z.string(),
	role: userRoleSchema.default("GENERAL"),
});

export type IUser = z.infer<typeof userSchema>;
const schema = new Schema<IUser>({
	phoneNumber: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: { type: String, required: true, default: "GENERAL" },
});

schema.index({ phoneNumber: 1 }, { unique: true });
schema.path("phoneNumber").required(true, "phoneNumber is required");
schema.path("role").required(true, "role is required");

export const userModelName = "User";

export default (models[userModelName] ||
	model<IUser>(userModelName, schema)) as Model<IUser>;
