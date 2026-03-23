"use client";

import { useState } from "react";
import { AlertTriangle, Bell, X } from "lucide-react";

const alerts = [
  {
    id: "1",
    type: "warning",
    title: "App Update Ready!",
    body: "Enjoy new features and improvements. Update now for a smoother experience.",
    bg: "bg-red-50 border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    xColor: "text-red-400",
    Icon: AlertTriangle,
  },
  {
    id: "2",
    type: "reminder",
    title: "Reminder",
    body: "Don't forget to submit your proposal for 'social media campaign'",
    bg: "bg-green-50 border-green-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-500",
    xColor: "text-green-400",
    Icon: Bell,
  },
];

const AlertBanners: React.FC = () => {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visible = alerts.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mb-2">
      {visible.map((alert) => {
        const Icon = alert.Icon;
        return (
          <div
            key={alert.id}
            className={`flex items-start gap-3 border rounded-xl px-4 py-3.5 relative ${alert.bg}`}
          >
            <div className={`w-9 h-9 rounded-full ${alert.iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={20} className={alert.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-lg ${alert.iconColor}`}>{alert.title}</p>
              <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{alert.body}</p>
            </div>
            <button
              onClick={() => setDismissed((prev) => [...prev, alert.id])}
              className={`${alert.xColor} hover:opacity-70 transition-opacity flex-shrink-0`}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default AlertBanners;