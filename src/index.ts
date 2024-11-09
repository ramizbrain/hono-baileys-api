import { serve } from "@hono/node-server";
import { Hono } from "hono";
import WhatsappAuthState from "../models/whatsapp/WhatsappAuthState.js";
import WhatsappClient from "../whatsapp/client.js";
import { connectToMongoDB } from "./db.js";
import sessionRoute from "./routes/session.route.js";

connectToMongoDB().then(async () => {
	await WhatsappClient.init();

	console.log(await WhatsappAuthState.find());

	const app = new Hono({ strict: false });
	app.route("/session", sessionRoute);

	app.get("/", (c) => {
		return c.text("Hello Hono!");
	});

	const port = 3000;
	console.log(`Server is running on http://localhost:${port}`);

	serve({
		fetch: app.fetch,
		port,
	});
});
