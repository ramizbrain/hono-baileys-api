import { Hono } from "hono";
import { contactController } from "../controllers/index.js";

const contactRoute = new Hono();

contactRoute.get("/", contactController.list);
contactRoute.get("/blocklist", contactController.listBlocked);

export default contactRoute;
