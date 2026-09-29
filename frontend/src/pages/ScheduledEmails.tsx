import { useEffect, useState } from "react";
import api from "../api/axios";

type Email = {
  id: string;
  to: string;
  subject: string;
  body: string;
  scheduledAt: string;
  status: string;
};

function ScheduledEmails() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScheduledEmails = async () => {
      try {
        const response = await api.get("/emails/scheduled");

        setEmails(response.data);
      } catch (error) {
        console.error("Failed to fetch scheduled emails:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduledEmails();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0714] px-6 py-8 text-white md:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-purple-400">
              Email Queue
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Scheduled Emails
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              View and manage emails waiting to be sent.
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href = "/schedule";
            }}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:from-purple-500 hover:to-pink-400"
          >
            + Schedule Email
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {/* Scheduled Count */}
          <div className="rounded-2xl border border-white/10 bg-[#181025] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Scheduled
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : emails.length}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-xl text-amber-400">
                ◷
              </div>
            </div>
          </div>

          {/* Next Email */}
          <div className="rounded-2xl border border-white/10 bg-[#181025] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Next Email
                </p>

                <h2 className="mt-2 text-sm font-semibold">
                  {loading
                    ? "Loading..."
                    : emails.length > 0
                    ? new Date(
                        emails[0].scheduledAt
                      ).toLocaleString()
                    : "No upcoming"}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-xl text-purple-400">
                📅
              </div>
            </div>
          </div>

          {/* Queue Status */}
          <div className="rounded-2xl border border-white/10 bg-[#181025] p-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Queue Status
                </p>

                <h2 className="mt-2 text-lg font-semibold">
                  System Online
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
              </div>
            </div>
          </div>

        </div>

        {/* Scheduled Emails */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#181025]">

          {/* Table Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-6 md:flex-row md:items-center">
            <div>
              <h2 className="font-semibold">
                Email Queue
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Emails scheduled for future delivery.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#0F0A18] px-3 py-2 text-xs text-slate-400">
              {emails.length} scheduled
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="p-6">
              <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-purple-500/20 bg-[#0F0A18]">
                <p className="text-sm text-slate-400">
                  Loading scheduled emails...
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && emails.length === 0 && (
            <div className="p-6">
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-purple-500/20 bg-[#0F0A18] px-6 text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 text-2xl">
                  ◷
                </div>

                <h3 className="mt-6 text-lg font-semibold">
                  No scheduled emails
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                  You don't have any emails waiting to be sent.
                  Schedule an email and it will appear here.
                </p>

                <button
                  onClick={() => {
                    window.location.href = "/schedule";
                  }}
                  className="mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 text-sm font-semibold shadow-lg shadow-purple-600/20 transition hover:from-purple-500 hover:to-pink-400"
                >
                  Schedule Your First Email →
                </button>

              </div>
            </div>
          )}

          {/* Email List */}
          {!loading && emails.length > 0 && (
            <div className="space-y-4 p-6">

              {emails.map((email) => (
                <div
                  key={email.id}
                  className="rounded-2xl border border-white/10 bg-[#0F0A18] p-5 transition hover:border-purple-500/30"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row">

                    {/* Email Information */}
                    <div className="min-w-0">

                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                          ✉
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-purple-300">
                            {email.to}
                          </p>

                          <h3 className="mt-1 truncate font-semibold text-white">
                            {email.subject}
                          </h3>
                        </div>
                      </div>

                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">
                        {email.body}
                      </p>

                    </div>

                    {/* Schedule Information */}
                    <div className="shrink-0 lg:min-w-[220px] lg:text-right">

                      <span className="inline-flex rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-400">
                        {email.status}
                      </span>

                      <p className="mt-3 text-xs text-slate-500">
                        Scheduled for
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-300">
                        {new Date(
                          email.scheduledAt
                        ).toLocaleString()}
                      </p>

                    </div>

                  </div>
                </div>
              ))}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ScheduledEmails;