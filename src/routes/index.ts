import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { validateSecretKey } from "../middlewares/auth.middleware.js";
import { sessionParams } from "../schema/session.schema.js";
import chatRoute from "./chat.route.js";
import contactRoute from "./contact.route.js";
import groupRoute from "./group.route.js";
import messageRoute from "./message.route.js";
import sessionRoute from "./session.route.js";

const app = new Hono({ strict: false });

// Terapkan middleware validasi secret key ke semua rute
app.use("*", validateSecretKey);

app.route("/session", sessionRoute);

app.use("/:sessionId/*", zValidator("param", sessionParams));
app.route("/:sessionId/contacts", contactRoute);
app.route("/:sessionId/chats", chatRoute);
app.route("/:sessionId/groups", groupRoute);
app.route("/:sessionId/messages", messageRoute);

export default app;
