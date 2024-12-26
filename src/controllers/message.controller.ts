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

const ACCEPTED_DOCUMENT_MIME_TYPES = [
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/epub+zip", // .epub
  "application/vnd.oasis.opendocument.text", // .odt
  "application/pdf", // .pdf
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "image/svg+xml", // .svg
  "text/plain", // .txt
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/zip", // .zip
  "application/x-zip-compressed", // .zip (windows upload)
  "audio/mpeg", // .mp3
  "video/mp4", // .mp4
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

export const sendDocument = async (
  c: Context<any, any, { out: { form: any } }>
) => {
  const sessionId = c.req.param("sessionId");
  const body = await c.req.parseBody();

  // validate if no document specified
  if (!body["file"]) {
    throw new HTTPException(400, {
      res: c.json({
        code: 400,
        status: "BAD_REQUEST",
        data: {
          message: "document unspecified",
        },
      }),
    });
  }

  const session = WhatsappClient.getSession(sessionId);

  const fileType = (body["file"] as File).type;
  if (!ACCEPTED_DOCUMENT_MIME_TYPES.includes(fileType)) {
    throw new HTTPException(400, {
      res: c.json({
        code: 400,
        status: "BAD_REQUEST",
        data: {
          message: "invalid document type, please upload supported format",
        },
      }),
    });
  }

  const file = await (body["file"] as File).arrayBuffer();

  const msg = await session?.sendMessage(body["jid"] as string, {
    document: Buffer.from(file),
    mimetype: fileType,
    caption: body["caption"] as string,
  });

  return c.json({
    code: 200,
    status: "OK",
    data: {
      message: `document sent to ${msg!.key.remoteJid} successfully!`,
    },
  });
};
