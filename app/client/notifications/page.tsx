"use client";

import { useState } from "react";
import Sidebar from "../../components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "../../components/client/my-desk/breadcrumb";
import NotificationFilterTabs from "../../components/client/notifications/notificationFilterTabs";
import NotificationItem from "../../components/client/notifications/notificationItem";
import type { NotifTab } from "../../components/client/notifications/notificationFilterTabs";
import type { NotificationGroup } from "../../data/notificationsData"; 
import { notifications as initialNotifications } from "../../data/notificationsData";
import { X } from "lucide-react";

const GROUPS: NotificationGroup[] = ["Today", "Yesterday", "This Week"];
const VISIBLE_COUNT = 9;

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NotifTab>("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifs, setNotifs] = useState(initialNotifications);
  const [visibleCount, setVisibleCount] = useState<number>(VISIBLE_COUNT);

  const handleRead = (id: number) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = notifs.filter((n) => {
    if (activeTab === "Unread")   return !n.read;
    if (activeTab === "Projects") return n.type === "proposal";
    if (activeTab === "Messages") return n.type === "message";
    return true;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="flex flex-col min-h-screen bg-white">

      <DashboardTopbar
        userName="Charles Eden"
        userAvatar="https://i.pravatar.cc/150?img=33"
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 relative">

        {/* Dark overlay — mobile only, shows when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — slides in on mobile, always visible on desktop */}
        <div
          className={`
            fixed top-0 left-0 h-full z-40
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10
          `}
        >
          {/* Close button inside sidebar on mobile */}
          <button
            className="absolute top-4 right-4 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>

          <Sidebar activeItem="Dashboard" />
        </div>

        {/* Main content — full width, no margin offset needed */}
        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">

          <Breadcrumb crumbs={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "Notifications" },
          ]} />

          {/* Header Row */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-[26px] font-extrabold text-[#1a1a2e] m-0">
              Notification
            </h1>
            <button
              onClick={handleMarkAllRead}
              className="bg-[#E2554F] border-none rounded-lg px-6 py-[11px] cursor-pointer text-white font-bold text-[14px] hover:bg-[#d44a44] transition-colors"
            >
              Mark All Read
            </button>
          </div>

          {/* Filter Tabs */}
          <NotificationFilterTabs active={activeTab} onChange={setActiveTab} />

          {/* Grouped Notifications */}
          <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
            {GROUPS.map((group) => {
              const groupItems = visible.filter((n) => n.group === group);
              if (groupItems.length === 0) return null;

              return (
                <div key={group}>
                  {/* Group Label */}
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <h3 className="m-0 text-[15px] font-bold text-[#1a1a2e]">{group}</h3>
                  </div>

                  {/* Items */}
                  <div className="flex flex-col gap-2.5 bg-[#fafafa]">
                    {groupItems.map((notif) => (
                      <NotificationItem
                        key={notif.id}
                        notification={notif}
                        onRead={handleRead}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Empty State */}
            {visible.length === 0 && (
              <div className="p-10 text-center text-gray-500 text-[14px]">
                No notifications found.
              </div>
            )}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-7">
              <button
                onClick={() => setVisibleCount((prev) => prev + VISIBLE_COUNT)}
                className="bg-[#E85D3A] border-none rounded-lg px-12 py-3 cursor-pointer text-white font-bold text-[14px] hover:bg-[#d44a44] transition-colors"
              >
                Load More
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Notifications;