import { pool } from "../database/database.js";
import { mtFetch } from "../helper/helper.js";

export const testConnectionController = async (req, res, next) => {
  try {
    const { name } = req.body;
    const query = `SELECT  system_user, ip_address, password FROM routers WHERE name = ?`;
    const [row] = await pool.query(query, [name]);

    const router = row[0];
    if (!router) {
      return res.status(404).json({
        success: false,
        message: `Router with name "${name}" not found in database`,
      });
    }
    const data = await mtFetch(router, "/system/resource");
    if (data) {
      return res
        .status(200)
        .json({ success: true, message: "Data was retrieved successfully!" });
    }
  } catch (e) {
    next(e);
  }
};
