const BASE = "http://localhost:5000/api/auth";

export async function apiSignup(name, email, password) {
  const res = await fetch(`${BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Signup failed");
  return data;
}

export async function apiLogin(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
}

// Starts a 14-day trial for the logged-in user
export async function apiStartTrial(annual = false) {
  const token = localStorage.getItem("travelogue_token");
  const res = await fetch(`${BASE}/trial`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ annual }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to start trial");
  return data; // { message, user }
}

export async function apiGetUsers() {
  const token = localStorage.getItem("travelogue_token");
  const res = await fetch(`${BASE}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch users");
  return data;
}

export const saveAuth = (token, user) => {
  localStorage.setItem("travelogue_token", token);
  localStorage.setItem("travelogue_user", JSON.stringify(user));
};

export const getStoredUser = () => {
  const u = localStorage.getItem("travelogue_user");
  return u ? JSON.parse(u) : null;
};

export const logout = () => {
  localStorage.removeItem("travelogue_token");
  localStorage.removeItem("travelogue_user");
};

export async function apiUpdateUserRole(userId, role) {
  const token = localStorage.getItem("travelogue_token");
  const res = await fetch(`${BASE}/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update role");
  return data;
}