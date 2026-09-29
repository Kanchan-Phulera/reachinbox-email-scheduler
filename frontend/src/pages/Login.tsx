import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message || "Invalid email or password."
        );
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0714] flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Logo and heading */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-2xl font-bold text-white shadow-lg shadow-purple-500/20">
            R
          </div>

          <h1 className="mt-5 text-3xl font-bold text-white">
            Welcome back
          </h1>

          <p className="mt-2 text-zinc-400">
            Sign in to your ReachInbox scheduler
          </p>
        </div>

        {/* Login form */}
        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-purple-500/20 bg-[#181025] p-7 shadow-2xl"
        >
          {/* Error message */}
          {errorMessage && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {errorMessage}
            </div>
          )}

          {/* Email */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-zinc-200">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-[#0B0714] px-4 py-3 text-white outline-none transition focus:border-purple-500"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-zinc-200">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-[#0B0714] px-4 py-3 text-white outline-none transition focus:border-purple-500"
            />
          </div>

          {/* Sign In */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Register link */}
          <p className="mt-5 text-center text-sm text-zinc-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-purple-400 hover:text-pink-400"
            >
              Create account
            </Link>
          </p>

          {/* Footer */}
          <p className="mt-5 text-center text-xs text-zinc-500">
            Email Job Scheduler
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;