import {
  isJidBroadcast,
  isJidGroup,
  isJidNewsletter,
  isJidStatusBroadcast,
  isJidUser,
} from "@whiskeysockets/baileys";
import { z } from "zod";

export const jidSchema = z
  .string()
  .refine(
    (jid) =>
      !/\s/.test(jid) ||
      isJidUser(jid) ||
      isJidGroup(jid) ||
      isJidBroadcast(jid) ||
      isJidNewsletter(jid) ||
      isJidStatusBroadcast(jid),
    "Invalid jid"
  );

export const textMessageSchema = z.object({
  text: z.string(),
  jid: jidSchema,
});

export type ITextMessage = z.infer<typeof textMessageSchema>;

export const imageMessageSchema = z.object({
  file: z.instanceof(File),
  jid: jidSchema,
  caption: z.string().optional(),
});

export type IImageMessage = z.infer<typeof imageMessageSchema>;
