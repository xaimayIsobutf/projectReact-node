import api from "./client";

export async function login(username, password) {
  const res = await api.get("/users", { username, password });
    if (res.status !== 200) throw new Error("Login failed");
  return res.data; 
}
export const signup = (name, email, password) =>
  api.post("/users", { name, email, password }).then(r => r.data);