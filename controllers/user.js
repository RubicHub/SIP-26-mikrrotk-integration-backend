import { pool } from "../database/database.js";
import { AUTH, ROUTEROS_BASE } from "../helper/helper.js";

export async function mtFetch(path, options = {}) {
  const res = await fetch(`${ROUTEROS_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${AUTH}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data?.detail || data?.message || `RouterOS error (${res.status})`,
    );
  return data;
}

const ALLOWED_PROFILE_SORTS = [
  "name",
  "rate_limit",
  "data_limit_bytes",
  "validity_days",
  "created_at",
];
const ALLOWED_SUBSCRIBER_SORTS = [
  "username",
  "is_active",
  "starts_at",
  "expires_at",
  "created_at",
];

export const getAllProfiles = async (req, res, next) => {
  const {
    search = "",
    sortBy = "created_at",
    order = "desc",
    limit = 10,
    page = 1,
  } = req.query;
  try {
    const offset = (Number(page) - 1) * Number(limit);
    const searchTerm = `%${search}%`;

    const sortColumn = ALLOWED_PROFILE_SORTS.includes(sortBy)
      ? sortBy
      : "created_at";
    const sortDirection = order.toLowerCase() === "asc" ? "ASC" : "DESC";

    const [profiles] = await pool.query(
      `SELECT * FROM profiles 
       WHERE name LIKE ? 
       ORDER BY ${sortColumn} ${sortDirection} 
       LIMIT ? OFFSET ?`,
      [searchTerm, Number(limit), offset],
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM profiles WHERE name LIKE ?`,
      [searchTerm],
    );

    return res.status(200).json({
      success: true,
      total,
      data: profiles,
    });
  } catch (e) {
    return next(e);
  }
};

export const createProfile = async (req, res, next) => {
  const {
    name,
    rateLimit,
    dataLimitBytes = null,
    validityDays = 30,
  } = req.body;

  try {
    const limitName = `${name}-limit`;
    const [rx, tx] = rateLimit.split("/");

    const limitPayload = {
      name: limitName,
      "rate-limit-rx": rx?.trim() || rateLimit,
      "rate-limit-tx": tx?.trim() || rx?.trim() || rateLimit,
    };

    if (dataLimitBytes) {
      limitPayload["transfer-limit"] = String(dataLimitBytes);
    }

    await mtFetch("/user-manager/limitation", {
      method: "PUT",
      body: JSON.stringify(limitPayload),
    });

    await mtFetch("/user-manager/profile", {
      method: "PUT",
      body: JSON.stringify({
        name: String(name),
        validity: `${validityDays}d`,
        "starts-when": "first-auth",
      }),
    });

    await mtFetch("/user-manager/profile-limitation", {
      method: "PUT",
      body: JSON.stringify({
        profile: String(name),
        limitation: limitName,
      }),
    });

    const [dbResult] = await pool.query(
      `INSERT INTO profiles (name, rate_limit, data_limit_bytes, validity_days) VALUES (?, ?, ?, ?)`,
      [name, rateLimit, dataLimitBytes, validityDays],
    );

    return res.status(201).json({
      success: true,
      message: "Profile created successfully",
      profileId: dbResult.insertId,
    });
  } catch (e) {
    return next(e);
  }
};

export const deleteProfile = async (req, res, next) => {
  const { name } = req.params;
  try {
    const [subs] = await pool.query(
      "SELECT id FROM subscribers WHERE profile_id = (SELECT id FROM profiles WHERE name = ?)",
      [name],
    );
    if (subs.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Profile is in use by subscribers" });
    }

    await pool.query("DELETE FROM profiles WHERE name = ?", [name]);

    const profiles = await mtFetch(
      `/user-manager/profile?name=${encodeURIComponent(name)}`,
    );
    if (profiles.length > 0) {
      await mtFetch(`/user-manager/profile/${profiles[0][".id"]}`, {
        method: "DELETE",
      });
    }

    const limitations = await mtFetch(
      `/user-manager/limitation?name=${encodeURIComponent(`${name}-limit`)}`,
    );
    if (limitations.length > 0) {
      await mtFetch(`/user-manager/limitation/${limitations[0][".id"]}`, {
        method: "DELETE",
      });
    }
    const profLimits = await mtFetch(
      `/user-manager/profile-limitation?profile=${encodeURIComponent(name)}`,
    );
    if (profLimits?.length > 0) {
      for (const item of profLimits) {
        await mtFetch(`/user-manager/profile-limitation/${item[".id"]}`, {
          method: "DELETE",
        });
      }
    }

    return res
      .status(200)
      .json({ success: true, message: "Profile deleted successfully" });
  } catch (e) {
    return next(e);
  }
};

export const getAllSubscribers = async (req, res, next) => {
  const {
    search = "",
    sortBy = "created_at",
    order = "desc",
    limit = 10,
    page = 1,
  } = req.query;
  try {
    const offset = (Number(page) - 1) * Number(limit);
    const searchTerm = `%${search}%`;

    const sortColumn = ALLOWED_SUBSCRIBER_SORTS.includes(sortBy)
      ? `s.${sortBy}`
      : "s.created_at";
    const sortDirection = order.toLowerCase() === "asc" ? "ASC" : "DESC";

    const [subscribers] = await pool.query(
      `SELECT s.*, p.name AS profile_name 
       FROM subscribers s 
       JOIN profiles p ON s.profile_id = p.id 
       WHERE s.username LIKE ? 
       ORDER BY ${sortColumn} ${sortDirection} 
       LIMIT ? OFFSET ?`,
      [searchTerm, Number(limit), offset],
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM subscribers WHERE username LIKE ?`,
      [searchTerm],
    );

    return res.status(200).json({
      success: true,
      total,
      data: subscribers,
    });
  } catch (e) {
    return next(e);
  }
};
export const createSubscriber = async (req, res, next) => {
  const { username, password, profile_id } = req.body;
  try {
    const [profiles] = await pool.query("SELECT * FROM profiles WHERE id = ?", [
      profile_id,
    ]);
    if (profiles.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }
    const profile = profiles[0];

    await mtFetch("/user-manager/user", {
      method: "PUT",
      body: JSON.stringify({
        name: username,
        password: password,
        group: "default",
      }),
    });

    await mtFetch("/user-manager/user-profile", {
      method: "PUT",
      body: JSON.stringify({
        user: username,
        profile: String(profile.name),
      }),
    });

    const [dbResult] = await pool.query(
      `INSERT INTO subscribers (profile_id, username, password, starts_at, expires_at) 
       VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY))`,
      [profile_id, username, password, profile.validity_days],
    );

    return res.status(201).json({
      success: true,
      message: "Subscriber created successfully",
      subscriberId: dbResult.insertId,
    });
  } catch (e) {
    return next(e);
  }
};

export const deleteSubscriber = async (req, res, next) => {
  const { username } = req.params;
  try {
    await pool.query("DELETE FROM subscribers WHERE username = ?", [username]);

    const users = await mtFetch(
      `/user-manager/user?name=${encodeURIComponent(username)}`,
    );
    if (users.length > 0) {
      await mtFetch(`/user-manager/user/${users[0][".id"]}`, {
        method: "DELETE",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Subscriber deleted successfully" });
  } catch (e) {
    return next(e);
  }
};

export const setSubscriberStatus = async (req, res, next) => {
  const { username } = req.params;
  const { isActive } = req.body;
  try {
    await pool.query(
      "UPDATE subscribers SET is_active = ? WHERE username = ?",
      [isActive ? 1 : 0, username],
    );

    const users = await mtFetch(
      `/user-manager/user?name=${encodeURIComponent(username)}`,
    );
    if (users.length > 0) {
      await mtFetch(`/user-manager/user/${users[0][".id"]}`, {
        method: "PATCH",
        body: JSON.stringify({ disabled: isActive ? "false" : "true" }),
      });
    }

    if (!isActive) {
      const active = await mtFetch(
        `/ppp/active?name=${encodeURIComponent(username)}`,
      );
      if (active.length > 0) {
        await mtFetch(`/ppp/active/${active[0][".id"]}`, { method: "DELETE" });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Subscriber ${isActive ? "enabled" : "disabled"} successfully`,
    });
  } catch (e) {
    return next(e);
  }
};

export const disconnectSubscriber = async (req, res, next) => {
  const { username } = req.params;
  try {
    const active = await mtFetch(
      `/ppp/active?name=${encodeURIComponent(username)}`,
    );
    if (active.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subscriber is not currently connected",
      });
    }

    await mtFetch(`/ppp/active/${active[0][".id"]}`, { method: "DELETE" });
    return res
      .status(200)
      .json({ success: true, message: "Subscriber session disconnected" });
  } catch (e) {
    return next(e);
  }
};
export const checkExpiry = () => {
  const run = async () => {
    try {
      const [expired] = await pool.query(
        "SELECT username FROM subscribers WHERE is_active = 1 AND expires_at <= NOW()",
      );

      for (const { username } of expired) {
        await pool.query(
          "UPDATE subscribers SET is_active = 0 WHERE username = ?",
          [username],
        );

        const users = await mtFetch(
          `/user-manager/user?name=${encodeURIComponent(username)}`,
        );
        if (users?.length > 0) {
          await mtFetch(`/user-manager/user/${users[0][".id"]}`, {
            method: "PATCH",
            body: JSON.stringify({ disabled: "true" }),
          });
        }

        const active = await mtFetch(
          `/ppp/active?name=${encodeURIComponent(username)}`,
        );
        if (active?.length > 0) {
          await mtFetch(`/ppp/active/${active[0][".id"]}`, {
            method: "DELETE",
          });
        }
      }
    } catch (e) {
      console.error("Expiry check error:", e.message);
    }
  };

  run();
  setInterval(run, 10 * 60 * 1000); // Runs every 10 minutes
};
