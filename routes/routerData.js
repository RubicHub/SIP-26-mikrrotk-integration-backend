import { Router } from "express";
import {
  deleteRouterData,
  getRouterDataById,
  postRouterData,
  putRouterData,
} from "../controllers/routerData.js";

const routerData = Router();

routerData.get("/router/:id", getRouterDataById);
routerData.post("/router/post", postRouterData);
routerData.put("/router/put/:id", putRouterData);
routerData.delete("/router/delete/:id", deleteRouterData);

export default routerData;
