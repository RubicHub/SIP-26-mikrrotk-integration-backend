import dotenv from "dotenv";

dotenv.config();

export async function mtFetch(router, path, options = {}) {
  const { system_user, ip_address, password } = router;
  const AUTH = Buffer.from(`${system_user}:${password}`).toString("base64");
  const result = await fetch(`http://${ip_address}/rest${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${AUTH}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = result.status === 204 ? null : await result.json();
  if (!result.ok) {
    const err = new Error(data?.message || `RouterOS error (${result.status})`);
    err.status = result.status;
    throw err;
  }
  return data;
}

// const router = await pool.query(`SELECT name, system_user, `);

// export async function getAllProfiles() {
//   return mtFetch("/ppp/profile");
// }
// export async function getAllSecrets() {
//   return mtFetch("/ppp/secret");
// }

// export async function findSecretByName(username) {
//   return mtFetch(`/ppp/secret?name=${encodeURIComponent(username)}`);
// }

// export async function findProfileByName(name) {
//   return mtFetch(`/ppp/profile?name=${encodeURIComponent(name)}`);
// }
