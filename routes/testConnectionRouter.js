import { Router } from "express";
import { testConnectionController } from "../controllers/test.js";

const routerData = Router();

routerData.get("/test/post", testConnectionController);

export default routerData;
