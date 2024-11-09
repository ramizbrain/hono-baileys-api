import { z } from "zod";

export const sessionSchema = z.object({
	sessionId: z.string(),
	phoneNumber: z.string().regex(/^\d+$/),
});

export const sessionParams = z.object({
	sessionId: z.string(),
});
