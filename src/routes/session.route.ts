import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { sessionController } from "../controllers/index.js";
import { sessionSchema } from "../schema/session.schema.js";

const sessionRoute = new Hono();

sessionRoute.get("/", sessionController.list);

sessionRoute.get(
	"/:sessionId",
	zValidator("param", sessionSchema.omit({ phoneNumber: true })),
	sessionController.findBySessionId
);

sessionRoute.get(
	"/:sessionId/:phoneNumber",
	zValidator("param", sessionSchema),
	sessionController.create
);

sessionRoute.delete(
	"/:sessionId",
	zValidator("param", sessionSchema.omit({ phoneNumber: true })),
	sessionController.destroy
);

export default sessionRoute;
