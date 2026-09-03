import { Router } from "express";
import { postRouterData } from "../controllers/routerData.js";

const routerData = Router();

routerData.post("/router/post", postRouterData);

export default routerData;
