"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import AlertBanners from "./alertBanners";
import NotificationGroup from "./notificationGroup";
import { AppNotification, NotificationGroup as NotificationGroupType } from "@/app/types";

const filterChips = ["All", "Unread", "Projects", "Messages"];
const PAGE_SIZE = 3;

const getTimeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const apiTypeToAppType = (type: string): AppNotification["type"] => {
  const map: Record<string, AppNotification["type"]> = {
    projects: "project",
    messages: "message",
    payments: "system",
    system: "system",
  };
  return map[type] ?? "system";
};

const getAvatarFallback = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a2e&color=fff&size=128`;

const groupByDate = (notifications: AppNotification[]): NotificationGroupType[] => {
  const today: AppNotification[] = [];
  const yesterday: AppNotification[] = [];
  const older: AppNotification[] = [];

  notifications.forEach((n) => {
    const timeAgo = n.timeAgo;
    if (timeAgo === "Just now" || timeAgo.endsWith("m ago") || timeAgo.endsWith("h ago")) {
      today.push(n);
    } else if (timeAgo === "1d ago") {
      yesterday.push(n);
    } else {
      older.push(n);
    }
  });

  const groups: NotificationGroupType[] = [];
  if (today.length) groups.push({ label: "Today", notifications: today });
  if (yesterday.length) groups.push({ label: "Yesterday", notifications: yesterday });
  if (older.length) groups.push({ label: "Older", notifications: older });
  return groups;
};

const NotificationsContent: React.FC = () => {
  const router = useRouter();
  const [activeChip, setActiveChip] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [notificationGroups, setNotificationGroups] = useState<NotificationGroupType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      if (!token) {
        router.push("/signin");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch notifications and approved pitches in parallel
      const [notifRes, pitchRes] = await Promise.all([
        fetch("/api/v1/notifications", { credentials: "include", headers }),
        fetch("/api/v1/pitches/me?status=APPROVED", { credentials: "include", headers }),
      ]);

      if (!notifRes.ok) throw new Error(`Failed to fetch notifications (${notifRes.status})`);

      const notifJson = await notifRes.json();
      const list = Array.isArray(notifJson.data) ? notifJson.data : [];

      // Build projectId → { name, avatar } map from approved pitches via briefs
      const titleClientMap: Record<string, { name: string; avatar: string }> = {};
      if (pitchRes.ok) {
        const pitchJson = await pitchRes.json();
        const pitchList = Array.isArray(pitchJson.data) ? pitchJson.data : [];

        await Promise.all(
          pitchList.map(async (p: any) => {
            try {
              const r = await fetch(`/api/v1/briefs/${p.briefId}`, {
                credentials: "include",
                headers,
              });
              if (r.ok) {
                const json = await r.json();
                const client = json.data?.client;
                const jobTitle = json.data?.jobTitle;
                if (client?.name && jobTitle) {
                  titleClientMap[jobTitle.toLowerCase()] = {
                    name: client.name,
                    avatar: client.imageUrl ?? client.avatarUrl ?? getAvatarFallback(client.name),
                  };
                }
              }
            } catch { }
          })
        );
      }

      // Pre-populate readIds from API
      const alreadyRead = list.filter((n: any) => n.isRead).map((n: any) => n.id);
      setReadIds(alreadyRead);

      const extractJobTitle = (body: string): string => {
        const match = body.match(/for\s+"([^"]+)"/);
        return match ? match[1].toLowerCase() : "";
      };

      const buildTitle = (n: any, clientName: string): string => {
        const type = n.type;
        const name = clientName;
        if (type === "projects") return `${name} accepted your proposal`;
        if (type === "messages") return `${name} sent you a message`;
        if (type === "reviews") return `New review from ${name}`;
        if (type === "payments") return `${name} confirmed payment`;
        return n.title;
      };

      const buildSubtitle = (n: any): string => {
        // Extract job title from body if present
        const jobMatch = n.body?.match(/for\s+"([^"]+)"/);
        if (jobMatch) return jobMatch[1];
        // For messages, return the body as preview
        if (n.type === "messages") return n.body ?? "";
        // For reviews, try to extract quoted text
        const reviewMatch = n.body?.match(/"([^"]+)"/);
        if (reviewMatch) return `"${reviewMatch[1]}"`;
        return n.body ?? "";
      };

      const mapped: AppNotification[] = list.map((n: any) => {
        const jobTitle = extractJobTitle(n.body ?? "");
        const clientInfo = titleClientMap[jobTitle];
        const clientName = clientInfo?.name ?? "Someone";

        return {
          id: n.id,
          type: apiTypeToAppType(n.type),
          title: buildTitle(n, clientName),
          subtitle: buildSubtitle(n),
          avatar: clientInfo?.avatar ?? getAvatarFallback(clientName),
          name: clientName,
          timeAgo: getTimeAgo(n.createdAt),
          isRead: n.isRead,
        };
      });

      setNotificationGroups(groupByDate(mapped));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();
      await fetch("/api/v1/notifications/read-all", {
        method: "PATCH",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const allIds = notificationGroups.flatMap((g) => g.notifications.map((n) => n.id));
      setReadIds(allIds);
    } catch { }
  };

  const markOneRead = async (id: string) => {
    setReadIds((prev) => [...prev, id]);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();
      await fetch(`/api/v1/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch { }
  };

  const filterNotif = (notifs: AppNotification[]) => {
    if (activeChip === "All") return notifs;
    if (activeChip === "Unread") return notifs.filter((n) => !readIds.includes(n.id));
    if (activeChip === "Projects") return notifs.filter((n) => n.type === "project");
    if (activeChip === "Messages") return notifs.filter((n) => n.type === "message");
    return notifs;
  };

  const visibleGroups = notificationGroups.slice(0, visibleCount);
  const hasMore = visibleCount < notificationGroups.length;

  return (
    <div>
      <Breadcrumb crumbs={[
        { label: "Dashboard", path: "/creative/dashboard" },
        { label: "Notifications" },
      ]} />

      <AlertBanners />

      <div className="flex items-center bg-[#fafafa] p-6 justify-between mb-4 mt-6">
        <h1 className="text-2xl font-bold text-gray-900">Notification</h1>
        <button
          onClick={markAllRead}
          className="bg-[#E2554F] hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
        >
          Mark All Read
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {filterChips.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveChip(chip)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeChip === chip
              ? "bg-[#E2554F] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-gray-400 text-center py-12">Loading notifications…</p>}
      {error && <p className="text-sm text-red-500 text-center py-12">{error}</p>}

      {!loading && !error && (
        <>
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
                  onRead={markOneRead}
                />
              );
            })}
            {notificationGroups.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-12">No notifications.</p>
            )}
          </div>

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
        </>
      )}
    </div>
  );
};

export default NotificationsContent;