import { Router } from "express";
import {
  createPPPprofile,
  createPPPSecret,
  deletePPPprofile,
  deletePPPSecret,
  disableConnection,
  disconnectActiveByUsername,
  editPPPprofile,
  editPPPSecret,
  enableConnection,
  findPPPprofile,
  findPPPSecret,
  getAllPPPprofiles,
  getAllPPPSecrets,
} from "../controllers/PPP.js";

const pppRouter = Router();

pppRouter.get("/secret", getAllPPPSecrets);
pppRouter.get("/secret/:username", findPPPSecret);
pppRouter.post("/secret", createPPPSecret);
pppRouter.patch("/secret/:username", editPPPSecret);
pppRouter.delete("/secret/:username", deletePPPSecret);

pppRouter.patch("/secret/:username/enable", enableConnection);
pppRouter.patch("/secret/:username/disable", disableConnection);

pppRouter.delete("/active/:username", disconnectActiveByUsername);

pppRouter.get("/profile", getAllPPPprofiles);
pppRouter.get("/profile/:name", findPPPprofile);
pppRouter.post("/profile", createPPPprofile);
pppRouter.patch("/profile/:name", editPPPprofile);
pppRouter.delete("/profile/:name", deletePPPprofile);

export default pppRouter;
