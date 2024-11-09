import type { Context } from "hono";
import GroupMetaDataModel from "../../models/whatsapp/GroupMetaDataModel.js";

export const list = async (c: Context) => {
	const sessionId = c.req.param("sessionId");

	return c.json(
		await GroupMetaDataModel.find(
			{
				sessionId: sessionId,
			},
			{ __v: false, sessionId: false }
		)
	);
};

export const find = async (c: Context) => {
	const sessionId = c.req.param("sessionId");
	const chatId = c.req.param("chatId");

	return c.json(
		await GroupMetaDataModel.findOne({ sessionId, chatId }, { _id: 0, __v: 0 })
	);
};
