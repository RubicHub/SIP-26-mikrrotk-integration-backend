import { pool } from "../database/database.js";

export const postRouterData = async (req, res, next) => {
  try {
    const { name, system_user, ip_address, password, auth_type } = req.body;
    const query = `
      INSERT INTO routers (name, system_user, ip_address, password, auth_type)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      name,
      system_user,
      ip_address,
      password,
      auth_type,
    ]);

    if (result || result.length > 0) {
      console.log({
        success: true,
        message: "Router's data created successfully",
        profileId: result.insertId,
      });
      return res.status(201).json({
        success: true,
        message: "Router's data created successfully",
        profileId: result.insertId,
      });
    }
    return res.status(403).json({
      success: false,
      message: "Router's was not data created successfully",
    });
  } catch (e) {
    next(e);
  }
};
export const getRouterDataByName = async (req, res, next) => {
  try {
    const { name } = req.params;
    const query = `
      SELECT * FROM routers WHERE name = ?`;

    const [result] = await pool.query(query, [name]);

    if (result || result.length > 0) {
      console.log({
        success: true,
        message: "Router's data created successfully",
        data: result,
      });
      return res.status(200).json({
        success: true,
        message: "Router retrieved successfully",
        data: result,
      });
    }
    return res.status(403).json({
      success: false,
      message: "Router wasn't retrieved successfully",
    });
  } catch (e) {
    next(e);
  }
};
