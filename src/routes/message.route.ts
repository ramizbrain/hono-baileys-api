import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { messageController } from "../controllers/index.js";
import { textMessageSchema } from "../schema/message.schema.js";

const messageRoute = new Hono();

messageRoute.post(
	"/",
	zValidator("form", textMessageSchema),
	messageController.send
);

export default messageRoute;
