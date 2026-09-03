import { Router } from "express";
import { testConnectionController } from "../controllers/test.js";

const testConnectionRouter = Router();

testConnectionRouter.post("/test/post", testConnectionController);

export default testConnectionRouter;
