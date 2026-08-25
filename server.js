import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import pppRouter from "./routes/pppRouter.js";
import { checkExpiry } from "./controllers/PPP.js";
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
  console.log("This is the base route for Mikrotik Service");
  return res
    .status(200)
    .json({
      success: true,
      message: "This is the base route for the mikrotik api",
    });
});

app.use("/api/v1/user", pppRouter);

app.use(ErrorMiddleware);

server.listen(port, () => {
  console.log(`The Mikrotik service is listening at the port ${port}`);
});
