import { serve } from "@hono/node-server";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import WhatsappClient from "../whatsapp/client.js";
import { connectToMongoDB } from "./db.js";
import chatRoute from "./routes/chat.route.js";
import contactRoute from "./routes/contact.route.js";
import sessionRoute from "./routes/session.route.js";
import { sessionParams } from "./schema/session.schema.js";

connectToMongoDB().then(async () => {
	await WhatsappClient.init();

	const app = new Hono({ strict: false });
	app.get("/", (c) => {
		return c.text("Hello Hono!");
	});

	app.route("/session", sessionRoute);

	app.use("/:sessionId/*", zValidator("param", sessionParams));
	app.route("/:sessionId/contact", contactRoute);
	app.route("/:sessionId/chat", chatRoute);

	const port = 3000;
	console.log(`Server is running on http://localhost:${port}`);

	serve({
		fetch: app.fetch,
		port,
	});
});
