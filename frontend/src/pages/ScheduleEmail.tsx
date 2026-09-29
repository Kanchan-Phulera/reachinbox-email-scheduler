import { useState } from "react";
import axios from "axios";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function ScheduleEmail() {
  const navigate = useNavigate();

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSchedule = async () => {
    setSuccess(false);
    setErrorMessage("");

    // Basic validation
    if (!to || !subject || !body || !date || !time) {
      setErrorMessage("Please fill in all fields before scheduling.");
      return;
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(to)) {
      setErrorMessage("Please enter a valid recipient email address.");
      return;
    }

    // --------------------------------------------------
    // Create local date safely
    // --------------------------------------------------
    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);

    const selectedDate = new Date(
      year,
      month - 1,
      day,
      hours,
      minutes,
      0,
      0
    );

    // Validate constructed date
    if (Number.isNaN(selectedDate.getTime())) {
      setErrorMessage("Please select a valid date and time.");
      return;
    }

    // Make sure the selected time is in the future
    const now = new Date();

    if (selectedDate.getTime() <= now.getTime()) {
      setErrorMessage(
        "Please select a future date and time for the email."
      );
      return;
    }

    try {
      setLoading(true);

      // Convert local date to ISO format for backend
      const scheduledAt = selectedDate.toISOString();

      console.log("Scheduling email:", {
        to,
        subject,
        scheduledAt,
        selectedDate: selectedDate.toString(),
      });

      const response = await api.post("/emails", {
        to,
        subject,
        body,
        scheduledAt,
      });

      console.log("Scheduled successfully:", response.data);

      setSuccess(true);

      // Clear form
      setTo("");
      setSubject("");
      setBody("");
      setDate("");
      setTime("");

      // Hide success message
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Schedule email error:", error);

      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.message;

        setErrorMessage(
          backendMessage ||
            "Failed to schedule the email. Please try again."
        );
      } else {
        setErrorMessage(
          "Something went wrong while scheduling the email."
        );
      }

      setTimeout(() => {
        setErrorMessage("");
      }, 4000);
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in local timezone
  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  return (
    <div className="min-h-screen bg-[#0B0714] px-6 py-8 text-white md:px-10">
      <div className="mx-auto max-w-4xl">

        {/* Notifications */}

        {success && (
          <div className="mb-6 flex items-center gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 shadow-lg shadow-emerald-950/20">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-lg text-emerald-400">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold text-emerald-300">
                Email scheduled successfully
              </p>

              <p className="mt-1 text-xs text-emerald-400/70">
                Your email has been added to the scheduler.
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 flex items-center gap-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 shadow-lg shadow-red-950/20">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-lg text-red-400">
              !
            </div>

            <div>
              <p className="text-sm font-semibold text-red-300">
                Unable to schedule email
              </p>

              <p className="mt-1 text-xs text-red-400/80">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* Page Header */}

        <div className="mb-8">
          <p className="text-sm font-medium text-purple-400">
            Email Composer
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Schedule an Email
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Compose your email, select a recipient, and choose when you want
            it to be sent.
          </p>
        </div>

        {/* Main Card */}

        <div className="overflow-hidden rounded-3xl border border-purple-500/10 bg-[#181025] shadow-2xl shadow-purple-950/20">

          {/* Card Header */}

          <div className="border-b border-white/10 px-6 py-5 md:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-500/20 text-xl">
                ✉
              </div>

              <div>
                <h2 className="font-semibold">
                  Email Details
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Enter the details of the email you want to schedule.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}

          <div className="space-y-6 p-6 md:p-8">

            {/* Recipient */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Recipient
              </label>

              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#0F0A18] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
              />

              <p className="mt-2 text-xs text-slate-500">
                Enter the email address of the recipient.
              </p>
            </div>

            {/* Subject */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Subject
              </label>

              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                className="w-full rounded-xl border border-white/10 bg-[#0F0A18] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
              />
            </div>

            {/* Message */}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-200">
                  Message
                </label>

                <span className="text-xs text-slate-500">
                  Email body
                </span>
              </div>

              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                placeholder="Write your email message here..."
                className="w-full resize-none rounded-xl border border-white/10 bg-[#0F0A18] px-4 py-3.5 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
              />
            </div>

            {/* Schedule */}

            <div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white">
                  Schedule
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Choose the date and time when this email should be sent.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {/* Date */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Date
                  </label>

                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={getTodayDate()}
                    className="w-full rounded-xl border border-white/10 bg-[#0F0A18] px-4 py-3.5 text-sm text-white outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                  />
                </div>

                {/* Time */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Time
                  </label>

                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0F0A18] px-4 py-3.5 text-sm text-white outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                  />
                </div>
              </div>
            </div>

            {/* Info */}

            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/5 p-5">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
                  ◷
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-purple-200">
                    Scheduled delivery
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Your email will be added to the BullMQ scheduler and
                    automatically processed at the selected time.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/")}
                disabled={loading}
                className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSchedule}
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:from-purple-500 hover:to-pink-400 hover:shadow-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Scheduling..." : "Schedule Email →"}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom note */}

        <p className="mt-5 text-center text-xs text-slate-600">
          Emails are processed automatically by the ReachInbox scheduler.
        </p>
      </div>
    </div>
  );
}

export default ScheduleEmail;