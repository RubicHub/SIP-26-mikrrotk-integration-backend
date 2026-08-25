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

const userRouter = Router();

userRouter.get("/user", getAllPPPSecrets);
userRouter.get("/user/:username", findPPPSecret);
userRouter.post("/user", createPPPSecret);
userRouter.patch("/user/:username", editPPPSecret);
userRouter.delete("/user/:username", deletePPPSecret);

userRouter.patch("/user/:username/enable", enableConnection);
userRouter.patch("/user/:username/disable", disableConnection);

userRouter.delete("/active/:username", disconnectActiveByUsername);

userRouter.get("/profile", getAllPPPprofiles);
userRouter.get("/profile/:name", findPPPprofile);
userRouter.post("/profile", createPPPprofile);
userRouter.patch("/profile/:name", editPPPprofile);
userRouter.delete("/profile/:name", deletePPPprofile);

export default userRouter;
