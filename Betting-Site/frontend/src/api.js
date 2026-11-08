const BASE = "http://localhost:8000/api";

function firstError(data) {
  if (!data || typeof data !== "object") return null;
  const v = Object.values(data)[0];
  return Array.isArray(v) ? v[0] : String(v);
}

export async function api(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("access");
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(data?.detail || firstError(data) || "Request failed");
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function login(username, password) {
  const tokens = await api("/auth/login/", {
    method: "POST",
    body: { username, password },
    auth: false,
  });
  localStorage.setItem("access", tokens.access);
  localStorage.setItem("refresh", tokens.refresh);
}