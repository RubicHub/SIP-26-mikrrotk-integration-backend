import { pool } from "../database/database.js";
import { AUTH, ROUTEROS_BASE } from "../helper/helper.js";

async function getAllSecrets() {
  return mtFetch("/ppp/secret");
}

export async function findSecretByName(username) {
  return mtFetch(`/ppp/secret?name=${encodeURIComponent(username)}`);
}

async function findProfileByName(name) {
  return mtFetch(`/ppp/profile?name=${encodeURIComponent(name)}`);
}

export const getAllPPPSecrets = async (req, res, next) => {
  const { search, order = "desc", sortBy, limit = 10, page = 1 } = req.query;
  try {
    let data = await getAllSecrets();

    if (search) {
      const q = search.toLowerCase().trim();
      data = data.filter((d) => {
        return d.name && d.name.toString().toLowerCase().includes(q);
      });
    }

    if (sortBy) {
      data.sort((a, b) => {
        const valA = a[sortBy] ? String(a[sortBy]) : "";
        const valB = b[sortBy] ? String(b[sortBy]) : "";

        if (order === "desc") {
          return valB.localeCompare(valA, undefined, { sensitivity: "base" });
        }
        return valA.localeCompare(valB, undefined, { sensitivity: "base" });
      });
    }

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedData = data.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      total: data.length,
      data: paginatedData,
    });
  } catch (e) {
    return next(e);
  }
};

export const createPPPSecret = async (req, res, next) => {
  const { username, password, profile = "default" } = req.body;
  try {
    const existing = await findSecretByName(username);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This user already exists as a PPPoE secret",
      });
    }

    const data = await mtFetch("/ppp/secret", {
      method: "PUT",
      body: JSON.stringify({
        name: username,
        password: password,
        service: "pppoe",
        profile: profile,
      }),
    });

    return res.status(201).json({
      success: true,
      message: "PPPoE secret created",
      data,
    });
  } catch (e) {
    return next(e);
  }
};

export const findPPPSecret = async (req, res, next) => {
  const { username } = req.params;
  try {
    const data = await findSecretByName(username);
    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No PPPoE secret found for: ${username}`,
      });
    }
    return res.status(200).json({ success: true, data: data[0] });
  } catch (e) {
    return next(e);
  }
};

export const editPPPSecret = async (req, res, next) => {
  const { username } = req.params;
  const { ...changes } = req.body;
  try {
    const existing = await findSecretByName(username);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No PPPoE secret found for: ${username}`,
      });
    }

    const id = existing[0][".id"];
    const data = await mtFetch(`/ppp/secret/${id}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    });

    return res.status(200).json({
      success: true,
      message: `PPPoE secret for ${username} updated`,
      data,
    });
  } catch (e) {
    return next(e);
  }
};

export const deletePPPSecret = async (req, res, next) => {
  const { username } = req.params;
  try {
    const existing = await findSecretByName(username);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No PPPoE secret found for: ${username}`,
      });
    }

    const id = existing[0][".id"];
    await mtFetch(`/ppp/secret/${id}`, { method: "DELETE" });

    return res.status(200).json({
      success: true,
      message: `PPPoE secret for ${username} deleted`,
    });
  } catch (e) {
    return next(e);
  }
};

export const enableConnection = async (req, res, next) => {
  const { username } = req.params;
  try {
    const existing = await findSecretByName(username);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No PPPoE secret found for: ${username}`,
      });
    }

    const id = existing[0][".id"];
    const data = await mtFetch(`/ppp/secret/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ disabled: "false" }),
    });

    return res.status(200).json({
      success: true,
      message: `${username} enabled`,
      data,
    });
  } catch (e) {
    return next(e);
  }
};

export const disableConnection = async (req, res, next) => {
  const { username } = req.params;
  try {
    const existing = await findSecretByName(username);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No PPPoE secret found for: ${username}`,
      });
    }

    const id = existing[0][".id"];
    const data = await mtFetch(`/ppp/secret/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ disabled: "true" }),
    });

    return res.status(200).json({
      success: true,
      message: `${username} disabled`,
      data,
    });
  } catch (e) {
    return next(e);
  }
};

export const disconnectActiveByUsername = async (req, res, next) => {
  const { username } = req.params;
  try {
    const active = await mtFetch(
      `/ppp/active?name=${encodeURIComponent(username)}`,
    );
    if (active.length === 0) {
      return res.status(404).json({
        success: false,
        message: `${username} is not currently connected`,
      });
    }

    const id = active[0][".id"];
    await mtFetch(`/ppp/active/${id}`, { method: "DELETE" });

    return res.status(200).json({
      success: true,
      message: `${username} disconnected`,
    });
  } catch (e) {
    return next(e);
  }
};

export const getAllPPPprofiles = async (req, res, next) => {
  const { search, order = "desc", sortBy, limit = 10, page = 1 } = req.query;
  try {
    let data = await getAllProfiles();

    if (search) {
      const q = search.toLowerCase().trim();
      data = data.filter((d) => {
        return d.name && d.name.toString().toLowerCase().includes(q);
      });
    }

    if (sortBy) {
      data.sort((a, b) => {
        const valA = a[sortBy] ? String(a[sortBy]) : "";
        const valB = b[sortBy] ? String(b[sortBy]) : "";

        if (order === "desc") {
          return valB.localeCompare(valA, undefined, { sensitivity: "base" });
        }

        return valA.localeCompare(valB, undefined, { sensitivity: "base" });
      });
    }

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedData = data.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      count: data.length,
      data: paginatedData,
    });
  } catch (e) {
    return next(e);
  }
};

export const createPPPprofile = async (req, res, next) => {
  const {
    name,
    dnsServer,
    localAddress,
    remoteAddress,
    upload = "10M",
    download = "10M",
  } = req.body;
  try {
    const existing = await findProfileByName(name);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This profile already exists",
      });
    }

    const body = {
      name,
      "dns-server": dnsServer || "1.1.1.1",
      "rate-limit": `${upload}/${download}`,
    };

    if (localAddress) body["local-address"] = localAddress;
    if (remoteAddress) body["remote-address"] = remoteAddress;

    const data = await mtFetch("/ppp/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return res.status(201).json({
      success: true,
      message: "Profile created",
      data,
    });
  } catch (e) {
    return next(e);
  }
};

export const findPPPprofile = async (req, res, next) => {
  const { name } = req.params;
  try {
    const data = await findProfileByName(name);
    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No profile found for: ${name}`,
      });
    }
    return res.status(200).json({ success: true, data: data[0] });
  } catch (e) {
    return next(e);
  }
};

export const editPPPprofile = async (req, res, next) => {
  const { name } = req.params;
  const { upload, download, dnsServer, localAddress, remoteAddress } = req.body;
  try {
    const existing = await findProfileByName(name);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No profile found for: ${name}`,
      });
    }

    const id = existing[0][".id"];
    const body = {};
    if (dnsServer) body["dns-server"] = dnsServer;
    if (localAddress !== undefined) body["local-address"] = localAddress;
    if (remoteAddress !== undefined) body["remote-address"] = remoteAddress;
    if (upload && download) body["rate-limit"] = `${upload}/${download}`;

    const data = await mtFetch(`/ppp/profile/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return res.status(200).json({
      success: true,
      message: `Profile ${name} updated`,
      data,
    });
  } catch (e) {
    return next(e);
  }
};

export const deletePPPprofile = async (req, res, next) => {
  const { name } = req.params;
  try {
    const data = await findProfileByName(name);
    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No profile found for: ${name}`,
      });
    }

    const secretsUsing = await mtFetch(
      `/ppp/secret?profile=${encodeURIComponent(name)}`,
    );
    if (secretsUsing && secretsUsing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${secretsUsing.length} secret(s) still use profile "${name}"`,
      });
    }

    const id = data[0][".id"];
    const result = await mtFetch(`/ppp/profile/${id}`, {
      method: "DELETE",
    });

    if (result) {
      return res.status(400).json({
        success: false,
        message: "Profile deleted was unsuccessful",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Profile deleted successfully" });
  } catch (e) {
    return next(e);
  }
};

export const checkExpiry = () => {
  let checking = false;

  setInterval(
    async () => {
      if (checking) return;

      try {
        console.log("[EXPIRY CHECK] Running at", new Date().toISOString());

        const [expiredUsers] = await pool.query(
          `SELECT id, username FROM \`user\`
         WHERE \`expiry-date\` IS NOT NULL
         AND \`expiry-date\` <= NOW()`,
        );

        for (const user of expiredUsers) {
          try {
            const secrets = await mtFetch(
              `/ppp/secret?name=${encodeURIComponent(user.username)}`,
            );

            if (!secrets || secrets.length === 0) continue;

            const secret = secrets[0];
            if (secret.disabled === "true") continue;

            await mtFetch(`/ppp/secret/${secret[".id"]}`, {
              method: "PATCH",
              body: JSON.stringify({ disabled: "true" }),
            });

            const active = await mtFetch(
              `/ppp/active?name=${encodeURIComponent(user.username)}`,
            );

            if (active && active.length > 0) {
              await mtFetch(`/ppp/active/${active[0][".id"]}`, {
                method: "DELETE",
              });
            }

            console.log(
              `[EXPIRY CHECK] Disabled expired user: ${user.username}`,
            );
          } catch (err) {
            console.error(
              `[EXPIRY CHECK] Failed for ${user.username}:`,
              err.message,
            );
          }
        }
      } catch (e) {
        console.error("[EXPIRY CHECK] Database error:", e.message);
      } finally {
        checking = false;
      }
    },
    1 * 60 * 1000,
  );
};
