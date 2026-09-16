"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email.trim(), password);
      // replace, pas push : le retour arrière ne doit pas ramener au formulaire.
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <form onSubmit={submit} className="admin-login-card">
        <p className="eyebrow" style={{ marginBottom: 18 }}>
          Administration
        </p>
        <h1
          style={{
            margin: "0 0 34px",
            fontFamily: "var(--serif)",
            fontWeight: 400,
            fontSize: "clamp(30px, 4vw, 44px)",
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
          }}
        >
          Velyná <span className="italic">Living</span>
        </h1>

        <div className="field" style={{ marginBottom: 26 }}>
          <label htmlFor="a-mail">E-mail</label>
          <input
            id="a-mail"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="field" style={{ marginBottom: 30 }}>
          <label htmlFor="a-pass">Mot de passe</label>
          <input
            id="a-pass"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && (
          <p className="field-error" style={{ marginBottom: 22 }}>
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-solid btn-block" disabled={loading}>
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
