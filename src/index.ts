import { serve } from "@hono/node-server";
import "dotenv/config";
import { createServer } from "http";
import WhatsappClient from "../whatsapp/client.js";
import { connectToMongoDB } from "./db.js";
import app from "./routes/index.js";
import { initWebSocketServer } from "./controllers/message-stream.controller.js";

connectToMongoDB().then(async () => {
	await WhatsappClient.init();

	const port = (process.env.PORT || 3000) as number;
	console.log(`Server is running on http://localhost:${port}`);

	// Gunakan serve dari @hono/node-server untuk menjalankan aplikasi Hono
	// Ini akan menangani headers dengan benar
	const server = serve({
		port,
		fetch: (req) => {
			// Tambahkan prefix /api ke semua rute
			const url = new URL(req.url);
			const originalPath = url.pathname;
			
			// Jika URL dimulai dengan /api, hapus prefix untuk diproses oleh Hono
			if (originalPath.startsWith("/api")) {
				url.pathname = originalPath.substring(4); // Hapus /api
				const newReq = new Request(url.toString(), req);
				return app.fetch(newReq);
			}
			
			// Untuk URL yang tidak dimulai dengan /api, gunakan Hono juga
			return app.fetch(req);
		}
	});
	
	// Inisialisasi WebSocket server dengan HTTP server yang sama
	initWebSocketServer(server);
	
	console.log(`Server HTTP dan WebSocket berjalan pada port ${port}`);
});
