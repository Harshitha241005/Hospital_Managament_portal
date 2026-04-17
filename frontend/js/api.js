const API_BASE_URL = "http://localhost:5000/api";

const Auth = {
  getToken() { return localStorage.getItem("hms_token"); },
  getUser() {
    const raw = localStorage.getItem("hms_user");
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
  setSession(token, user) {
    localStorage.setItem("hms_token", token);
    localStorage.setItem("hms_user", JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem("hms_token");
    localStorage.removeItem("hms_user");
  },
  logout() { this.clear(); window.location.href = "/"; },
  async requireAuth(role) {
    const token = this.getToken();
    const user = this.getUser();
    if (!token || !user) { window.location.href = "/"; return null; }
    if (role && user.role !== role) { window.location.href = "/"; return null; }
    return user;
  }
};

async function apiFetch(endpoint, options = {}) {
  const token = Auth.getToken();
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body: options.body
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => ({}))
    : await res.text().catch(() => "");

  if (res.status === 401) {
    Auth.clear();
    window.location.href = "/";
    throw new Error(data?.message || "Session expired. Please login again.");
  }

  if (!res.ok) throw new Error(data?.message || `API Error (${res.status})`);
  return data;
}

const API = {
  auth: {
    login: (body) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(body) }),
    register: (body) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify(body) }),
    me: () => apiFetch("/auth/me"),
    updateMe: (body) => apiFetch("/auth/me", { method: "PUT", body: JSON.stringify(body) }),
    resetPassword: (body) => apiFetch("/auth/reset-password", { method: "POST", body: JSON.stringify(body) })
  },
  appointments: {
    getAll: (params) => apiFetch("/appointments" + (params ? "?" + new URLSearchParams(params) : "")),
    getOne: (id) => apiFetch(`/appointments/${id}`),
    create: (body) => apiFetch("/appointments", { method: "POST", body: JSON.stringify(body) }),
    updateStatus: (id, body) => apiFetch(`/appointments/${id}/status`, { method: "PATCH", body: JSON.stringify(body) }),
    update: (id, body) => apiFetch(`/appointments/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id) => apiFetch(`/appointments/${id}`, { method: "DELETE" })
  },
  patient: {
    appointments: () => apiFetch("/patient/appointments"),
    prescriptions: () => apiFetch("/patient/prescriptions"),
    bills: () => apiFetch("/patient/bills")
  },
  prescriptions: {
    getAll: () => apiFetch("/prescriptions"),
    getOne: (id) => apiFetch(`/prescriptions/${id}`),
    create: (body) => apiFetch("/prescriptions", { method: "POST", body: JSON.stringify(body) })
  },
  bills: {
    getAll: () => apiFetch("/bills"),
    getOne: (id) => apiFetch(`/bills/${id}`),
    createFromPrescription: (prescriptionId, body) =>
      apiFetch(`/bills/from-prescription/${prescriptionId}`, { method: "POST", body: JSON.stringify(body) }),
    update: (id, body) => apiFetch(`/bills/${id}`, { method: "PATCH", body: JSON.stringify(body) })
  },
  reports: {
    getAll: () => apiFetch("/reports"),
    create: (body) => apiFetch("/reports", { method: "POST", body: JSON.stringify(body) }),
    delete: (id) => apiFetch(`/reports/${id}`, { method: "DELETE" })
  },
  users: {
    doctors: (params) => apiFetch("/users/doctors" + (params ? "?" + new URLSearchParams(params) : "")),
    patients: () => apiFetch("/users/patients"),
    all: () => apiFetch("/users/all"),
    getOne: (id) => apiFetch(`/users/${id}`),
    update: (id, body) => apiFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id) => apiFetch(`/users/${id}`, { method: "DELETE" })
  },
  admin: {
    stats: () => apiFetch("/admin/stats"),
    bills: () => apiFetch("/admin/bills"),
    addDoctor: (body) => apiFetch("/admin/doctors", { method: "POST", body: JSON.stringify(body) })
  },
  doctor: {
    appointments: () => apiFetch("/doctor/appointments")
  },
  medicines: {
    getAll: (params) => apiFetch("/medicines" + (params ? "?" + new URLSearchParams(params) : "")),
    create: (body) => apiFetch("/medicines", { method: "POST", body: JSON.stringify(body) }),
    update: (id, body) => apiFetch(`/medicines/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id) => apiFetch(`/medicines/${id}`, { method: "DELETE" })
  },
  diseases: {
    getAll: (params) => apiFetch("/diseases" + (params ? "?" + new URLSearchParams(params) : ""))
  }
};

window.Auth = Auth;
window.API = API;
window.apiFetch = apiFetch;
