import type { Context } from "hono";
import WhatsappClient from "../../whatsapp/client.js";

export const list = async (c: Context) => {
	return c.json(WhatsappClient.listSessions());
};

export const findBySessionId = async (c: Context) => {
	const sessionId = c.req.param("sessionId");
	if (!WhatsappClient.sessionExists(sessionId)) {
		return c.json(
			{
				error: "Session does not exist",
			},
			400
		);
	}
	return c.json(WhatsappClient.getSession(sessionId));
};

export const create = async (c: Context) => {
	const sessionId = c.req.param("sessionId");
	const phoneNumber = c.req.param("phoneNumber");
	if (WhatsappClient.sessionExists(sessionId)) {
		return c.json(
			{
				error: "Session already exists",
			},
			400
		);
	}

	await WhatsappClient.createSession(sessionId);

	await new Promise((resolve) => setTimeout(resolve, 1000));

	const socket = WhatsappClient.getSession(sessionId)!;

	const code = await socket.requestPairingCode(phoneNumber);

	return c.json({ message: "Session Code", pairing_code: code });
};

export const destroy = async (c: Context) => {
	const sessionId = c.req.param("sessionId");
	await WhatsappClient.deleteSession(sessionId);

	return c.json({ message: "Session deleted" });
};
