import { Hono } from "hono";
import { groupController } from "../controllers/index.js";

const groupRoute = new Hono();

groupRoute.get("/", groupController.list);
groupRoute.get("/:chatId", groupController.find);

export default groupRoute;
