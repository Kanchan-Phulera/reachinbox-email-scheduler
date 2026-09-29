import { Worker } from "bullmq";
import nodemailer from "nodemailer";
import { prisma } from "../config/db";
import { redisConnection } from "../config/redis";

const transporter = nodemailer.createTransport({
  host: process.env.ETHEREAL_HOST,
  port: Number(process.env.ETHEREAL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASSWORD,
  },
});

export const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    const { emailId } = job.data;

    console.log("=================================");
    console.log("Processing email job:", job.id);
    console.log("Email ID:", emailId);

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
        process.env.ETHEREAL_HOST ? "Present" : "MISSING"
      );
      console.log(
        "ETHEREAL_PORT:",
        process.env.ETHEREAL_PORT ? "Present" : "MISSING"
      );
      console.log(
        "ETHEREAL_USER:",
        process.env.ETHEREAL_USER ? "Present" : "MISSING"
      );
      console.log(
        "ETHEREAL_PASSWORD:",
        process.env.ETHEREAL_PASSWORD ? "Present" : "MISSING"
      );

      console.log("Verifying SMTP connection...");

      await transporter.verify();

      console.log("SMTP connection verified successfully.");

      console.log("Sending email...");

      const info = await transporter.sendMail({
        from: process.env.ETHEREAL_USER,
        to: email.to,
        subject: email.subject,
        text: email.body,
      });

      console.log("Email sent successfully.");

      const previewUrl = nodemailer.getTestMessageUrl(info);

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
      console.error("Error:", error);

      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
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
);

emailWorker.on("completed", (job) => {
  console.log("BullMQ job completed:", job.id);
});

emailWorker.on("failed", (job, error) => {
  console.error("BullMQ job failed:", job?.id);
  console.error("BullMQ error:", error);
});