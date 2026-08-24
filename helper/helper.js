import dotenv from "dotenv";

dotenv.config();

export const ROUTEROS_BASE = `http://${process.env.ROUTEROS_HOST}/rest`;
export const AUTH = Buffer.from(
  `${process.env.ROUTEROS_USER}:${process.env.ROUTEROS_PASSWORD}`,
).toString("base64");
