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
      message: "Router's data was not created successfully",
    });
  } catch (e) {
    next(e);
  }
};
export const getRouterDataById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT * FROM routers WHERE id = ?`;

    const [result] = await pool.query(query, [id]);

    if (result || result.length > 0) {
      console.log({
        success: true,
        message: "Router's data retrieved successfully",
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

export const putRouterData = async (req, res, next) => {
  try {
    const { name, system_user, ip_address, password, auth_type } = req.body;
    const { id } = req.params;
    const query = `
      UPDATE routers set name = ?, system_user = ? , ip_address = ?, password = ?, auth_type = ? where id = ?
    `;
    const [result] = await pool.query(query, [
      name,
      system_user,
      ip_address,
      password,
      auth_type,
      id,
    ]);

    if (result || result.length > 0) {
      console.log({
        success: true,
        message: "Router's data changed successfully",
      });
      return res.status(201).json({
        success: true,
        message: "Router's data changed successfully",
      });
    }
    return res.status(403).json({
      success: false,
      message: "Router's data was not changed successfully",
    });
  } catch (e) {
    next(e);
  }
};
export const deleteRouterData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = `
      DELETE FROM routers WHERE id = ?
    `;

    const [result] = await pool.query(query, [id]);

    if (result || result.length > 0) {
      console.log({
        success: true,
        message: "Router's data deleted successfully",
      });
      return res.status(201).json({
        success: true,
        message: "Router's data deleted successfully",
      });
    }
    return res.status(403).json({
      success: false,
      message: "Router's data was not deleted successfully",
    });
  } catch (e) {
    next(e);
  }
};
