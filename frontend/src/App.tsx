import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api/axios";
import ScheduleEmail from "./pages/ScheduleEmail";
import ScheduledEmails from "./pages/ScheduledEmails";
import SentEmails from "./pages/SentEmails";
import Login from "./pages/Login";
import Register from "./pages/Register";

type Email = {
  id: string;
  to: string;
  subject: string;
  body: string;
  scheduledAt: string;
  status: "SCHEDULED" | "PROCESSING" | "SENT" | "FAILED";
  sentAt: string | null;
  previewUrl?: string | null;
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navClass = (path: string) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive(path)
        ? "bg-gradient-to-r from-purple-600/20 to-pink-500/10 text-white border border-purple-500/10"
        : "text-zinc-400 hover:bg-white/5 hover:text-white"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0B0714] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-purple-500/10 bg-[#120B20] p-5 md:flex">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-lg font-bold shadow-lg shadow-purple-500/20">
                R
              </div>

              <div>
                <h1 className="font-bold tracking-wide text-white">
                  ReachInbox
                </h1>
                <p className="text-xs text-zinc-500">Email Scheduler</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            <Link to="/" className={navClass("/")}>
              ⌂ <span>Dashboard</span>
            </Link>

            <Link to="/schedule" className={navClass("/schedule")}>
              ✉ <span>Schedule Email</span>
            </Link>

            <Link to="/scheduled" className={navClass("/scheduled")}>
              ◷ <span>Scheduled</span>
            </Link>

            <Link to="/sent" className={navClass("/sent")}>
              ✓ <span>Sent</span>
            </Link>
          </nav>

          <div className="mt-auto">
            <div className="rounded-2xl border border-purple-500/10 bg-white/5 p-4">
              <p className="text-xs text-zinc-500">Scheduler status</p>

              <div className="mt-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40" />

                <span className="text-sm font-medium text-white">
                  System Online
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500 font-semibold text-white">
                  K
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Kanchan</p>
                  <p className="text-xs text-zinc-500">Developer</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-4 w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
              >
                ↪ Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="border-b border-purple-500/10 bg-[#0B0714]/90 px-6 py-5 backdrop-blur md:px-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500">Email workspace</p>

                <h2 className="mt-1 text-2xl font-bold text-white md:text-3xl">
                  ReachInbox
                </h2>
              </div>

              <button
                onClick={() => navigate("/schedule")}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:opacity-90"
              >
                + Schedule Email
              </button>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        // Uses authenticated Axios instance.
        // JWT token is automatically attached by the interceptor.
        const response = await api.get<Email[]>("/emails");

        setEmails(response.data);
      } catch (error) {
        console.error("Failed to fetch emails:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  const totalEmails = emails.length;

  const scheduledEmails = emails.filter(
    (email) => email.status === "SCHEDULED",
  ).length;

  const sentEmails = emails.filter(
    (email) => email.status === "SENT",
  ).length;

  const failedEmails = emails.filter(
    (email) => email.status === "FAILED",
  ).length;

  const upcomingEmails = emails
    .filter((email) => email.status === "SCHEDULED")
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() -
        new Date(b.scheduledAt).getTime(),
    )
    .slice(0, 3);

  return (
    <section className="p-6 md:p-10">
      <div className="mb-8">
        <p className="text-sm text-purple-400">Email workspace</p>

        <h1 className="mt-1 text-3xl font-bold text-white">
          Welcome back, Kanchan 👋
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Manage and track your scheduled emails.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-purple-500/10 bg-[#181025] p-6 transition hover:-translate-y-1 hover:border-purple-500/20">
          <p className="text-sm text-zinc-400">Total Emails</p>

          <div className="mt-4 flex items-end justify-between">
            <h3 className="text-4xl font-bold text-white">
              {loading ? "..." : totalEmails}
            </h3>

            <span className="rounded-lg bg-purple-500/10 px-2 py-1 text-xs text-purple-400">
              All
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-500/10 bg-[#181025] p-6 transition hover:-translate-y-1 hover:border-purple-500/20">
          <p className="text-sm text-zinc-400">Scheduled</p>

          <div className="mt-4 flex items-end justify-between">
            <h3 className="text-4xl font-bold text-white">
              {loading ? "..." : scheduledEmails}
            </h3>

            <span className="rounded-lg bg-amber-500/10 px-2 py-1 text-xs text-amber-400">
              Pending
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-500/10 bg-[#181025] p-6 transition hover:-translate-y-1 hover:border-purple-500/20">
          <p className="text-sm text-zinc-400">Sent</p>

          <div className="mt-4 flex items-end justify-between">
            <h3 className="text-4xl font-bold text-white">
              {loading ? "..." : sentEmails}
            </h3>

            <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
              Sent
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-500/10 bg-[#181025] p-6 transition hover:-translate-y-1 hover:border-purple-500/20">
          <p className="text-sm text-zinc-400">Failed</p>

          <div className="mt-4 flex items-end justify-between">
            <h3 className="text-4xl font-bold text-white">
              {loading ? "..." : failedEmails}
            </h3>

            <span className="rounded-lg bg-red-500/10 px-2 py-1 text-xs text-red-400">
              Issues
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-purple-500/10 bg-[#181025] xl:col-span-2">
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <div>
              <h3 className="font-semibold text-white">Upcoming Emails</h3>

              <p className="mt-1 text-sm text-zinc-400">
                Emails waiting to be sent
              </p>
            </div>

            <button
              onClick={() => navigate("/scheduled")}
              className="text-sm font-medium text-purple-400 hover:text-pink-400"
            >
              View all
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-12 text-center text-sm text-zinc-400">
                Loading scheduled emails...
              </div>
            ) : upcomingEmails.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-2xl">
                  ✉
                </div>

                <h4 className="mt-4 font-medium text-white">
                  No scheduled emails
                </h4>

                <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-400">
                  Schedule your first email and it will appear here.
                </p>

                <button
                  onClick={() => navigate("/schedule")}
                  className="mt-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  Schedule an Email
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEmails.map((email) => (
                  <div
                    key={email.id}
                    className="rounded-xl border border-white/10 bg-[#0B0714] p-4 hover:border-purple-500/30"
                  >
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-purple-400">
                          {email.to}
                        </p>

                        <h4 className="mt-1 truncate font-semibold text-white">
                          {email.subject}
                        </h4>

                        <p className="mt-1 truncate text-sm text-zinc-400">
                          {email.body}
                        </p>
                      </div>

                      <div className="shrink-0 text-left md:text-right">
                        <span className="inline-block rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400">
                          Scheduled
                        </span>

                        <p className="mt-2 text-xs text-zinc-500">
                          {new Date(email.scheduledAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {scheduledEmails > 3 && (
                  <button
                    onClick={() => navigate("/scheduled")}
                    className="w-full rounded-xl border border-white/10 py-3 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
                  >
                    View all {scheduledEmails} scheduled emails
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-purple-500/10 bg-[#181025]">
          <div className="border-b border-white/10 p-6">
            <h3 className="font-semibold text-white">Recent Activity</h3>

            <p className="mt-1 text-sm text-zinc-400">
              Latest scheduler events
            </p>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-10 text-center text-sm text-zinc-400">
                Loading activity...
              </div>
            ) : emails.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                  ◷
                </div>

                <p className="mt-4 text-sm font-medium text-white">
                  No activity yet
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Your email activity will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {emails.slice(0, 5).map((email) => (
                  <div key={email.id} className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        email.status === "SENT"
                          ? "bg-emerald-400"
                          : email.status === "SCHEDULED"
                            ? "bg-amber-400"
                            : email.status === "FAILED"
                              ? "bg-red-400"
                              : "bg-purple-400"
                      }`}
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {email.subject}
                      </p>

                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {email.to}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {email.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule" element={<ScheduleEmail />} />
          <Route path="/scheduled" element={<ScheduledEmails />} />
          <Route path="/sent" element={<SentEmails />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;