import { Request, Response } from "express";
import { prisma } from "../config/db";
import { emailQueue } from "../queues/email.queue";
export const createEmail = async (req: Request, res: Response) => {
  try {
    const { to, subject, body, scheduledAt } = req.body;

    if (!to || !subject || !body || !scheduledAt) {
      return res.status(400).json({
        message: "to, subject, body and scheduledAt are required",
      });
    }

    const scheduledDate = new Date(scheduledAt);

    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        message: "scheduledAt must be a valid date",
      });
    }

    const delay = scheduledDate.getTime() - Date.now();

    if (delay <= 0) {
      return res.status(400).json({
        message: "scheduledAt must be a future date",
      });
    }

    const email = await prisma.email.create({
      data: {
        to,
        subject,
        body,
        scheduledAt: scheduledDate,
      },
    });

    await emailQueue.add(
      "send-email",
      {
        emailId: email.id,
      },
      {
        delay,
      },
    );

    res.status(201).json({
      message: "Email scheduled successfully",
      email,
    });
  } catch (error) {
    console.error("Create email error:", error);

    res.status(500).json({
      message: "Failed to schedule email",
    });
  }
};
export const getAllEmails = async (req: Request, res: Response) => {
  try {
    const emails = await prisma.email.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(emails);
  } catch (error) {
    console.error("Get emails error:", error);

    res.status(500).json({
      message: "Failed to fetch emails",
    });
  }
};

export const getScheduledEmails = async (req: Request, res: Response) => {
  try {
    const emails = await prisma.email.findMany({
      where: {
        status: "SCHEDULED",
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });

    res.json(emails);
  } catch (error) {
    console.error("Get scheduled emails error:", error);

    res.status(500).json({
      message: "Failed to fetch scheduled emails",
    });
  }
};

export const getSentEmails = async (req: Request, res: Response) => {
  try {
    const emails = await prisma.email.findMany({
      where: {
        status: "SENT",
      },
      orderBy: {
        sentAt: "desc",
      },
    });

    res.json(emails);
  } catch (error) {
    console.error("Get sent emails error:", error);

    res.status(500).json({
      message: "Failed to fetch sent emails",
    });
  }
};