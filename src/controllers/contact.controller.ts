import type { Context } from "hono";
import ContactModel from "../../models/whatsapp/ContactModel.js";
import WhatsappClient from "../../whatsapp/client.js";

export const list = async (c: Context) => {
	const sessionId = c.req.param("sessionId");
	return c.json(
		await ContactModel.find(
			{
				sessionId: sessionId,
			},
			{ __v: false, sessionId: false }
		)
	);
};

export const listBlocked = async (c: Context) => {
	try {
		const sessionId = c.req.param("sessionId");
		const session = WhatsappClient.getSession(sessionId)!;
		const data = await session.fetchBlocklist();
		return c.json(data);
	} catch (e) {
		const message = "An error occured during blocklist fetch";
		return c.json({ error: message }, 500);
	}
};
