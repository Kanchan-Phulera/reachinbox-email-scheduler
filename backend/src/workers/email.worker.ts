import "dotenv/config";
import { Worker } from "bullmq";
import nodemailer from "nodemailer";
import { prisma } from "../config/db";
import { redisConnection } from "../config/redis";

const ENABLE_EMAIL_WORKER =
  process.env.ENABLE_EMAIL_WORKER === "true";

console.log("========== WORKER DEBUG ==========");
console.log(
  "ENABLE_EMAIL_WORKER:",
  process.env.ENABLE_EMAIL_WORKER
);
console.log("Worker enabled:", ENABLE_EMAIL_WORKER);
console.log(
  "REDIS_URL:",
  process.env.REDIS_URL ? "Present" : "MISSING"
);
console.log("==================================");

// Redis connection debugging
redisConnection.on("connect", () => {
  console.log("REDIS: Connecting...");
});

redisConnection.on("ready", () => {
  console.log("REDIS: Connection READY");
});

redisConnection.on("error", (error) => {
  console.error("REDIS ERROR:", error.message);
});

redisConnection.on("close", () => {
  console.log("REDIS: Connection CLOSED");
});

if (!ENABLE_EMAIL_WORKER) {
  console.log("Email worker is disabled.");
  console.log("API will run without processing email jobs.");
}

const transporter = nodemailer.createTransport({
  host: process.env.ETHEREAL_HOST,
  port: Number(process.env.ETHEREAL_PORT) || 587,
  secure: false,

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,

  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASSWORD,
  },
});

export const emailWorker = ENABLE_EMAIL_WORKER
  ? new Worker(
      "email-queue",
      async (job) => {
        const { emailId } = job.data;

        console.log("=================================");
        console.log("PROCESSING EMAIL JOB");
        console.log("Job ID:", job.id);
        console.log("Email ID:", emailId);

        await prisma.$connect();
        const email = await prisma.email.findUnique({
          where: {
            id: emailId,
          },
        });

        if (!email) {
          console.error("Email not found:", emailId);
          throw new Error("Email not found");
        }

        console.log("Recipient:", email.to);
        console.log("Subject:", email.subject);
        console.log("Scheduled at:", email.scheduledAt);

        await prisma.email.update({
          where: {
            id: emailId,
          },
          data: {
            status: "PROCESSING",
          },
        });

        try {
          console.log("Checking Ethereal SMTP configuration...");

          console.log(
            "ETHEREAL_HOST:",
            process.env.ETHEREAL_HOST
              ? "Present"
              : "MISSING"
          );

          console.log(
            "ETHEREAL_PORT:",
            process.env.ETHEREAL_PORT
              ? "Present"
              : "MISSING"
          );

          console.log(
            "ETHEREAL_USER:",
            process.env.ETHEREAL_USER
              ? "Present"
              : "MISSING"
          );

          console.log(
            "ETHEREAL_PASSWORD:",
            process.env.ETHEREAL_PASSWORD
              ? "Present"
              : "MISSING"
          );

          console.log("Verifying SMTP connection...");

          await transporter.verify();

          console.log(
            "SMTP connection verified successfully."
          );

          console.log("Sending email...");

          const info = await transporter.sendMail({
            from: process.env.ETHEREAL_USER,
            to: email.to,
            subject: email.subject,
            text: email.body,
          });

          console.log("Email sent successfully.");

          const previewUrl =
            nodemailer.getTestMessageUrl(info);

          console.log("Message ID:", info.messageId);
          console.log("Preview URL:", previewUrl);

          await prisma.email.update({
            where: {
              id: emailId,
            },
            data: {
              status: "SENT",
              sentAt: new Date(),
              messageId: info.messageId,
              previewUrl: previewUrl || null,
            },
          });

          console.log("Database updated: SENT");
          console.log("=================================");
        } catch (error) {
          console.error("=================================");
          console.error("EMAIL SEND FAILED");
          console.error("Email ID:", emailId);

          if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
          } else {
            console.error("Unknown error:", error);
          }

          await prisma.email.update({
            where: {
              id: emailId,
            },
            data: {
              status: "FAILED",
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown email sending error",
            },
          });

          console.error("Database updated: FAILED");
          console.error("=================================");

          throw error;
        }
      },
      {
        connection: redisConnection,
      }
    )
  : null;

if (emailWorker) {
  console.log("EMAIL WORKER CREATED");
  console.log("QUEUE NAME: email-queue");

  emailWorker.on("ready", () => {
    console.log(
      "BULLMQ WORKER READY - CONNECTED TO REDIS"
    );
  });

  emailWorker.on("active", (job) => {
    console.log(
      "BULLMQ JOB ACTIVE:",
      job.id
    );
  });

  emailWorker.on("completed", (job) => {
    console.log(
      "BULLMQ JOB COMPLETED:",
      job.id
    );
  });

  emailWorker.on("failed", (job, error) => {
    console.error(
      "BULLMQ JOB FAILED:",
      job?.id
    );
    console.error(
      "BULLMQ ERROR:",
      error.message
    );
  });

  emailWorker.on("error", (error) => {
    console.error(
      "BULLMQ WORKER ERROR:",
      error.message
    );
  });

  emailWorker.on("stalled", (jobId) => {
    console.error(
      "BULLMQ JOB STALLED:",
      jobId
    );
  });
}