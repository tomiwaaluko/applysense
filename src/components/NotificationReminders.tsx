"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

type Reminder = {
  id: string;
  jobId: string;
  company: string;
  title: string;
  type: "follow_up" | "interview_prep" | "deadline";
  date: Date;
  message: string;
};

export function NotificationReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: jobs } = api.job.getAll.useQuery();

  useEffect(() => {
    if (!jobs) return;

    const upcomingReminders: Reminder[] = [];
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    jobs.forEach((job) => {
      const appliedDate = new Date(job.date);
      const followUpDate = new Date(appliedDate);
      followUpDate.setDate(appliedDate.getDate() + 7); // Follow up after 1 week

      // Follow-up reminders for applications without response
      if (
        job.status.toLowerCase() === "applied" &&
        followUpDate <= threeDaysFromNow &&
        followUpDate >= now
      ) {
        upcomingReminders.push({
          id: `follow_up_${job.id}`,
          jobId: job.id,
          company: job.company,
          title: job.title,
          type: "follow_up",
          date: followUpDate,
          message: `Follow up on your application at ${job.company}`,
        });
      }

      // Interview preparation reminders
      if (job.status.toLowerCase() === "interview") {
        const interviewPrepDate = new Date(appliedDate);
        interviewPrepDate.setDate(appliedDate.getDate() + 1); // Prep reminder day before

        if (interviewPrepDate <= threeDaysFromNow && interviewPrepDate >= now) {
          upcomingReminders.push({
            id: `interview_prep_${job.id}`,
            jobId: job.id,
            company: job.company,
            title: job.title,
            type: "interview_prep",
            date: interviewPrepDate,
            message: `Prepare for your interview at ${job.company} for ${job.title}`,
          });
        }
      }
    });

    setReminders(upcomingReminders);
  }, [jobs]);

  const formatReminderDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString();
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case "follow_up":
        return "📧";
      case "interview_prep":
        return "📝";
      case "deadline":
        return "⏰";
      default:
        return "🔔";
    }
  };

  if (reminders.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        🔔
        {reminders.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {reminders.length}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute top-12 right-0 z-10 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-200 px-4 py-3">
            <h3 className="text-sm font-medium text-gray-900">
              Upcoming Reminders ({reminders.length})
            </h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="border-b border-gray-100 px-4 py-3 hover:bg-gray-50"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">
                    {getReminderIcon(reminder.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {reminder.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatReminderDate(reminder.date)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3">
            <button
              onClick={() => setShowNotifications(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
