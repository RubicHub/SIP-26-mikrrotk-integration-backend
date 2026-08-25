import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import userRouter from "./routes/userRouter.js";
import { checkExpiry } from "./controllers/user.js";
import { ErrorMiddleware } from "./middleware/handleErrors.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(urlencoded({ extended: true }));

const server = http.createServer(app);

checkExpiry();

const port = process.env.PORT || 9001;

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Base route for MikroTik RADIUS Management API",
  });
});

app.use("/api/v1", userRouter);

app.use(ErrorMiddleware);

server.listen(port, () => {
  console.log(`MikroTik service running on port ${port}`);
});
