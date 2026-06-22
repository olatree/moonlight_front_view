

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const result = await login(formData.loginId, formData.password);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    const redirectPaths = {
      admin: "/admin",
      super_admin: "/admin",
      master_admin: "/admin",
      teacher: "/admin",
      principal: "/admin",
    };

    navigate(redirectPaths[result.user.role] || "/dashboard", {
      replace: true,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-green-700">
          Staff Login
        </h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="loginId"
            value={formData.loginId}
            onChange={handleChange}
            required
            className="w-full rounded-lg border px-4 py-2"
            placeholder="User ID"
            autoComplete="username"
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full rounded-lg border px-4 py-2"
            placeholder="Password"
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-700 py-2 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}