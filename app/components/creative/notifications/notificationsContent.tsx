"use client";

import { useState } from "react";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import AlertBanners from "./alertBanners";
import NotificationGroup from "./notificationGroup";
import { notificationGroups } from "@/app/data";
import { AppNotification } from "@/app/types";

const filterChips = ["All", "Unread", "Projects", "Messages"];
const PAGE_SIZE = 3;

const NotificationsContent: React.FC = () => {
  const [activeChip, setActiveChip] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [readIds, setReadIds] = useState<string[]>([]);

  const markAllRead = () => {
    const allIds = notificationGroups.flatMap((g) => g.notifications.map((n) => n.id));
    setReadIds(allIds);
  };

  const filterNotif = (notifs: AppNotification[]) => {
    if (activeChip === "All") return notifs;
    if (activeChip === "Unread") return notifs.filter((n) => !readIds.includes(n.id));
    return notifs.filter((n) => n.type === activeChip.toLowerCase());
  };

  const visibleGroups = notificationGroups.slice(0, visibleCount);
  const hasMore = visibleCount < notificationGroups.length;

  return (
    <div>
      <Breadcrumb crumbs={[
        { label: "Dashboard", path: "/creative/dashboard" },
        { label: "Notifications" },
      ]} />

      {/* Alert banners */}
      <AlertBanners />

      {/* Header */}
      <div className="flex items-center bg-[#fafafa] p-6 justify-between mb-4 mt-6">
        <h1 className="text-2xl font-bold text-gray-900">Notification</h1>
        <button
          onClick={markAllRead}
          className="bg-[#E2554F] hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
        >
          Mark All Read
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-6">
        {filterChips.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveChip(chip)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeChip === chip
                ? "bg-[#E2554F] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Notification groups */}
      <div className="bg-[#fafafa] p-6 flex flex-col gap-6">
        {visibleGroups.map((group) => {
          const filtered = filterNotif(group.notifications);
          if (filtered.length === 0) return null;
          return (
            <NotificationGroup
              key={group.label}
              label={group.label}
              notifications={filtered}
              readIds={readIds}
              onRead={(id) => setReadIds((prev) => [...prev, id])}
            />
          );
        })}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleCount((prev) => prev + 1)}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-12 py-3 rounded-lg transition-colors text-sm"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsContent;