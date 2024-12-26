import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import WhatsappClient from "../../whatsapp/client.js";
import type { ITextMessage } from "../schema/message.schema.js";

const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

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
  c: Context<any, any, { out: { form: any } }>
) => {
  const sessionId = c.req.param("sessionId");
  const body = await c.req.parseBody();

  const session = WhatsappClient.getSession(sessionId);

  const fileType = (body["file"] as File).type;

  if (!ACCEPTED_IMAGE_MIME_TYPES.includes(fileType)) {
    throw new HTTPException(400, {
      res: c.json({
        code: 400,
        status: "BAD_REQUEST",
        data: {
          message:
            "invalid image type, Only .jpg, .jpeg, .png and .webp formats are supported.",
        },
      }),
    });
  }

  const file = await (body["file"] as File).arrayBuffer();

  const msg = await session?.sendMessage(body["jid"] as string, {
    image: Buffer.from(file),
    caption: body["caption"] as string,
  });

  return c.json({
    code: 200,
    status: "OK",
    data: {
      message: `send message to ${msg!.key.remoteJid} success!`,
    },
  });
};
