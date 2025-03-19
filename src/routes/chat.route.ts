import { Hono } from "hono";
import { chatController } from "../controllers/index.js";
import { streamMessages } from "../controllers/message-stream.controller.js";

const chatRoute = new Hono();

chatRoute.get("/", chatController.list);
chatRoute.get("/:chatId", chatController.find);

// Endpoint WebSocket untuk streaming pesan masuk
chatRoute.get("/:sessionId/messages/stream", streamMessages);

export default chatRoute;
