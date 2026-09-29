import { Worker } from "bullmq";
import nodemailer from "nodemailer";
import { prisma } from "../config/db";
import { redisConnection } from "../config/redis";

const transporter = nodemailer.createTransport({
  host: process.env.ETHEREAL_HOST,
  port: Number(process.env.ETHEREAL_PORT),
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASSWORD,
  },
});

export const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    const { emailId } = job.data;

    const email = await prisma.email.findUnique({
      where: {
        id: emailId,
      },
    });

    if (!email) {
      throw new Error("Email not found");
    }

    await prisma.email.update({
      where: {
        id: emailId,
      },
      data: {
        status: "PROCESSING",
      },
    });

    try {
      const info = await transporter.sendMail({
        from: process.env.ETHEREAL_USER,
        to: email.to,
        subject: email.subject,
        text: email.body,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);

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

      console.log("Email sent successfully:", emailId);
      console.log("Preview URL:", previewUrl);
    } catch (error) {
      await prisma.email.update({
        where: {
          id: emailId,
        },
        data: {
          status: "FAILED",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
  }
);