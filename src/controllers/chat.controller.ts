import type { Context } from "hono";
import ChatModel from "../../models/whatsapp/ChatModel.js";

export const list = async (c: Context) => {
	const sessionId = c.req.param("sessionId");

	return c.json(await ChatModel.find({ sessionId }, { _id: 0, __v: 0 }));
};
export const find = async (c: Context) => {
	const sessionId = c.req.param("sessionId");
	const chatId = c.req.param("chatId");

	return c.json(
		await ChatModel.findOne({ sessionId, chatId }, { _id: 0, __v: 0 })
	);
};
