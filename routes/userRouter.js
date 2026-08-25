import { Router } from "express";
import {
  getAllProfiles,
  createProfile,
  deleteProfile,
  getAllSubscribers,
  createSubscriber,
  deleteSubscriber,
  setSubscriberStatus,
  disconnectSubscriber,
} from "../controllers/user.js";

const userRouter = Router();

userRouter.get("/user", getAllSubscribers);
userRouter.post("/user", createSubscriber);
userRouter.delete("/user/:username", deleteSubscriber);
userRouter.patch("/user/:username/status", setSubscriberStatus);
userRouter.delete("/active/:username", disconnectSubscriber);

userRouter.get("/profile", getAllProfiles);
userRouter.post("/profile", createProfile);
userRouter.delete("/profile/:name", deleteProfile);

export default userRouter;
