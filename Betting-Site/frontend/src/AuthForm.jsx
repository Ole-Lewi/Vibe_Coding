import { useState } from "react";
import { api, login } from "./api";

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await api("/auth/register/", { method: "POST", body: form, auth: false });
      }
      await login(form.username, form.password);
      onAuth();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h3>{mode === "login" ? "Log in" : "Create account"}</h3>
      <input placeholder="Username" value={form.username} onChange={set("username")} required />
      {mode === "register" && (
        <input type="email" placeholder="Email" value={form.email} onChange={set("email")} />
      )}
      <input type="password" placeholder="Password (min 8)" value={form.password} onChange={set("password")} required />
      {error && <p className="error">{error}</p>}
      <button className="primary" disabled={loading}>
        {loading ? "..." : mode === "login" ? "Log in" : "Sign up"}
      </button>
      <button
        type="button"
        className="link"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login" ? "No account? Sign up" : "Have an account? Log in"}
      </button>
    </form>
  );
}