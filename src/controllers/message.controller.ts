import type { Context } from "hono";
import WhatsappClient from "../../whatsapp/client.js";
import type { IImageMessage, ITextMessage } from "../schema/message.schema.js";

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

export const sendImage = async (
  c: Context<any, any, { out: { form: IImageMessage } }>
) => {
  const sessionId = c.req.param("sessionId");
  const body = await c.req.parseBody();

  const session = WhatsappClient.getSession(sessionId);

  const file = await (body["file"] as File).arrayBuffer();

  const msg = await session?.sendMessage(body["jid"] as string, {
    image: Buffer.from(file),
    caption: body["caption"] as string,
  });

  return c.json(msg);
};
