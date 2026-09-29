import { useEffect, useState } from "react";
import api from "../api/axios";

type Email = {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string | null;
  messageId: string | null;
  previewUrl: string | null;
  status: string;
};

function SentEmails() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSentEmails = async () => {
      try {
        const response = await api.get("/emails/sent");

        setEmails(response.data);
      } catch (error) {
        console.error("Failed to fetch sent emails:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSentEmails();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0714] px-6 py-8 text-white md:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div>
          <p className="text-sm font-medium text-purple-400">
            Email History
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Sent Emails
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            View emails that have been successfully processed and sent.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {/* Total Sent */}
          <div className="rounded-2xl border border-white/10 bg-[#181025] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Total Sent
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : emails.length}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-xl text-emerald-400">
                ✓
              </div>
            </div>
          </div>

          {/* Successful */}
          <div className="rounded-2xl border border-white/10 bg-[#181025] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Successful
                </p>

                <h2 className="mt-2 text-lg font-semibold">
                  {loading ? "Loading..." : `${emails.length} emails sent`}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-xl text-purple-400">
                ✉
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="rounded-2xl border border-white/10 bg-[#181025] p-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Delivery Status
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

        {/* Sent Email History */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#181025]">

          {/* Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-6 md:flex-row md:items-center">
            <div>
              <h2 className="font-semibold">
                Sent Email History
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Emails that have already been processed.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#0F0A18] px-3 py-2 text-xs text-slate-400">
              {emails.length} sent
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="p-6">
              <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-purple-500/20 bg-[#0F0A18]">
                <p className="text-sm text-slate-400">
                  Loading sent emails...
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && emails.length === 0 && (
            <div className="p-6">
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-purple-500/20 bg-[#0F0A18] px-6 text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-purple-500/10 text-2xl">
                  ✓
                </div>

                <h3 className="mt-6 text-lg font-semibold">
                  No sent emails
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                  Emails that are successfully sent will appear here
                  with their delivery details and preview links.
                </p>

                <div className="mt-6 rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-3">
                  <p className="text-xs text-emerald-400">
                    ✓ Email delivery system is ready
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* Sent Emails List */}
          {!loading && emails.length > 0 && (
            <div className="space-y-4 p-6">

              {emails.map((email) => (
                <div
                  key={email.id}
                  className="rounded-2xl border border-white/10 bg-[#0F0A18] p-5 transition hover:border-purple-500/30"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row">

                    {/* Email Details */}
                    <div className="min-w-0 flex-1">

                      <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                          ✓
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

                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
                        {email.body}
                      </p>

                      {email.sentAt && (
                        <p className="mt-3 text-xs text-slate-500">
                          Sent on{" "}
                          {new Date(email.sentAt).toLocaleString()}
                        </p>
                      )}

                    </div>

                    {/* Status + Preview */}
                    <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">

                      <span className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400">
                        {email.status}
                      </span>

                      {email.previewUrl ? (
                        <a
                          href={email.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:from-purple-500 hover:to-pink-400"
                        >
                          View Email Preview ↗
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Preview unavailable
                        </span>
                      )}

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

export default SentEmails;