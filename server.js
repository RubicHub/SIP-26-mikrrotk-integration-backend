import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./routes/userRouter.js";
import { checkExpiry } from "./controllers/user.js";
import { ErrorMiddleware } from "./middleware/handleErrors.js";
import pppRouter from "./routes/pppRouter.js";
import routerData from "./routes/routerData.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(urlencoded({ extended: true }));

// checkExpiry();

const port = process.env.PORT || 9001;

app.get("/api/v1", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Base route for MikroTik RADIUS Management API",
  });
});

app.use("/api/v1", routerData);
app.use("/api/v1", userRouter);
app.use("/api/v1", pppRouter);

app.use(ErrorMiddleware);

app.listen(port, () => {
  console.log(`MikroTik service running on port ${port}`);
});
