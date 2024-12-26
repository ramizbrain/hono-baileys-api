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

// const MAX_FILE_SIZE = 1024 * 1024 * 5;

// const ACCEPTED_IMAGE_TYPES = ["jpeg", "jpg", "png", "webp"];

// export const imageMessageSchema = z.object({
//   file: z
//     .instanceof(File)
//     .refine((file) => file.size <= MAX_FILE_SIZE, {
//       message: `The image is too large.`,
//     })
//     .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
//       message: "Please upload a valid image file (JPEG, PNG, or WebP).",
//     }),
//   jid: jidSchema,
//   caption: z.string().optional(),
// });

// export type IImageMessage = z.infer<typeof imageMessageSchema>;
