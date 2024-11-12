import type { Context } from "hono";
import WhatsappClient from "../../whatsapp/client.js";
import type { ITextMessage } from "../schema/message.schema.js";

export const send = async (
	c: Context<any, any, { out: { form: ITextMessage } }>
) => {
	const sessionId = c.req.param("sessionId");
	const { jid, text } = c.req.valid("form");

	const session = WhatsappClient.getSession(sessionId);

	const msg = await session?.sendMessage(jid, {
		text,
	});

	return c.json(msg);
};
