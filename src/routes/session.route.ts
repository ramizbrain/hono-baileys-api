import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { sessionController } from "../controllers/index.js";
import { sessionParams, sessionSchema } from "../schema/session.schema.js";

const sessionRoute = new Hono();

sessionRoute.get("/", sessionController.list);

sessionRoute.get(
	"/:sessionId",
	zValidator("param", sessionParams),
	sessionController.findBySessionId
);

sessionRoute.get(
	"/:sessionId/:phoneNumber",
	zValidator("param", sessionSchema),
	sessionController.create
);

sessionRoute.delete(
	"/:sessionId",
	zValidator("param", sessionParams),
	sessionController.destroy
);

export default sessionRoute;
