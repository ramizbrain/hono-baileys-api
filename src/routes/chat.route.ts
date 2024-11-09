import { Hono } from "hono";
import { chatController } from "../controllers/index.js";

const chatRoute = new Hono();

chatRoute.get("/", chatController.list);
chatRoute.get("/:chatId", chatController.find);

export default chatRoute;
