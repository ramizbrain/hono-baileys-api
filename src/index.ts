import { serve } from "@hono/node-server";
import WhatsappClient from "../whatsapp/client.js";
import { connectToMongoDB } from "./db.js";
import app from "./routes/index.js";

connectToMongoDB().then(async () => {
	await WhatsappClient.init();

	const port = 3000;
	console.log(`Server is running on http://localhost:${port}`);

	serve({
		fetch: app.fetch,
		port,
	});
});
