"use client";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "../../components/client/my-desk/breadcrumb";
import NotificationFilterTabs from "../../components/client/notifications/notificationFilterTabs";
import NotificationItem from "../../components/client/notifications/notificationItem";
import type { NotifTab } from "../../components/client/notifications/notificationFilterTabs";
import type { Notification, NotificationGroup } from "../../data/notificationsData";
import { Loader2, X } from "lucide-react";

type ClientProfile = {
  name: string;
  clientProfile: {
    fullName: string;
    imageUrl: string | null;
  };
};

const GROUPS: NotificationGroup[] = ["Today", "Yesterday", "This Week"];
const VISIBLE_COUNT = 9;

const getAvatarFallback = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a2e&color=fff&size=128`;

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

const getGroup = (dateStr: string): NotificationGroup => {
  const date = new Date(dateStr);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return "This Week";
};

const apiTypeToClientType = (type: string): Notification["type"] => {
  const map: Record<string, Notification["type"]> = {
    projects: "proposal",
    messages: "message",
    reviews: "review",
    payments: "proposal",
    system: "proposal",
    new_proposal: "proposal",
    deliverable_submitted: "proposal",
  };
  return map[type] ?? "proposal";
};

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NotifTab>("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [notifIdMap, setNotifIdMap] = useState<Record<number, string>>({});
  const [visibleCount, setVisibleCount] = useState<number>(VISIBLE_COUNT);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [notifsLoading, setNotifsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const res = await fetch("/api/v1/clients/me", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        const json = await res.json();
        setProfile(json.data);
      } catch {
        // fail silently
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // fetch notifications
  const fetchNotifications = useCallback(async () => {
    setNotifsLoading(true);
    setError(null);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Build imageMap from suggested creatives
      const imageMap: Record<string, string> = {};
      try {
        const suggestedRes = await fetch("/api/v1/creatives/suggested", {
          headers,
          credentials: "include",
        });
        if (suggestedRes.ok) {
          const suggestedJson = await suggestedRes.json();
          (Array.isArray(suggestedJson.data) ? suggestedJson.data : []).forEach((c: any) => {
            if (c.name && c.imageUrl) imageMap[c.name] = c.imageUrl;
            if (c.fullName && c.imageUrl) imageMap[c.fullName] = c.imageUrl;
          });
        }
      } catch { }

      const notifRes = await fetch("/api/v1/notifications", {
        credentials: "include",
        headers,
      });
      if (!notifRes.ok) throw new Error("Failed to fetch notifications");

      const notifJson = await notifRes.json();
      const list = Array.isArray(notifJson.data) ? notifJson.data : [];

      // Build avatarMap
      const avatarMap: Record<string, string> = {};
      await Promise.all(
        list.map(async (n: any) => {
          try {
            if (n.type === "new_proposal") {
              const pitchRes = await fetch(`/api/v1/pitches/${n.relatedEntityId}`, {
                credentials: "include",
                headers,
              });
              if (!pitchRes.ok) return;
              const pitchJson = await pitchRes.json();
              const briefId = pitchJson.data?.briefId;
              if (!briefId) return;

              const briefPitchesRes = await fetch(`/api/v1/briefs/${briefId}/pitches`, {
                credentials: "include",
                headers,
              });
              if (!briefPitchesRes.ok) return;
              const briefPitchesJson = await briefPitchesRes.json();
              const pitches = briefPitchesJson.data?.pitches ?? briefPitchesJson.data ?? [];
              const pitch = (Array.isArray(pitches) ? pitches : []).find(
                (p: any) => p.id === n.relatedEntityId
              );
              const cp = pitch?.creativeProfile;
              const name = cp?.fullName ?? cp?.name ?? "Creative";
              avatarMap[n.relatedEntityId] =
                imageMap[name] ?? cp?.avatarUrl ?? cp?.imageUrl ?? getAvatarFallback(name);

            } else if (n.type === "deliverable_submitted") {
              const projectsRes = await fetch(`/api/v1/projects`, {
                credentials: "include",
                headers,
              });
              if (!projectsRes.ok) return;
              const projectsJson = await projectsRes.json();
              const projects = projectsJson.data?.data ?? projectsJson.data ?? [];

              for (const project of Array.isArray(projects) ? projects : []) {
                const detailRes = await fetch(`/api/v1/projects/${project.id}`, {
                  credentials: "include",
                  headers,
                });
                if (!detailRes.ok) continue;
                const detailJson = await detailRes.json();
                const briefId = detailJson.data?.briefId;
                const pitchId = detailJson.data?.pitchId;
                if (!briefId || !pitchId) continue;

                const briefPitchesRes = await fetch(`/api/v1/briefs/${briefId}/pitches`, {
                  credentials: "include",
                  headers,
                });
                if (!briefPitchesRes.ok) continue;
                const briefPitchesJson = await briefPitchesRes.json();
                const pitches = briefPitchesJson.data?.pitches ?? briefPitchesJson.data ?? [];
                const pitch = (Array.isArray(pitches) ? pitches : []).find(
                  (p: any) => p.id === pitchId
                );
                if (!pitch) continue;

                const cp = pitch?.creativeProfile;
                const name = cp?.fullName ?? cp?.name ?? "Creative";
                avatarMap[n.relatedEntityId] =
                  imageMap[name] ?? cp?.avatarUrl ?? cp?.imageUrl ?? getAvatarFallback(name);
                break;
              }
            }
          } catch { }
        })
      );

      const mapped: Notification[] = list.map((n: any, index: number) => {
        const timeAgo = getTimeAgo(n.createdAt);
        return {
          id: index + 1,
          type: apiTypeToClientType(n.type),
          group: getGroup(n.createdAt),
          read: n.isRead ?? false,
          avatar: avatarMap[n.relatedEntityId] ?? getAvatarFallback("Someone"),
          title: n.title ?? n.body ?? "",
          subtitle: n.type !== "reviews" ? (n.body ?? undefined) : undefined,
          rating: n.type === "reviews" ? (n.rating ?? undefined) : undefined,
          quote: n.type === "reviews" ? (n.quote ?? undefined) : undefined,
          time: timeAgo,
        };
      });

      // build real id map
      const idMap: Record<number, string> = {};
      list.forEach((n: any, index: number) => {
        idMap[index + 1] = n.id;
      });
      setNotifIdMap(idMap);
      setNotifs(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setNotifsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRead = async (id: number) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();
      const realId = notifIdMap[id];
      await fetch(`/api/v1/notifications/${realId}/read`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch { }
  };

  const handleMarkAllRead = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
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
    } catch { }
  };

  const filtered = notifs.filter((n) => {
    if (activeTab === "Unread") return !n.read;
    if (activeTab === "Projects") return n.type === "proposal";
    if (activeTab === "Messages") return n.type === "message";
    return true;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const userName = profile?.clientProfile?.fullName || profile?.name || "Client";
  const userAvatar =
    profile?.clientProfile?.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  if (profileLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#E2554F]" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <DashboardTopbar
        userName={userName}
        userAvatar={userAvatar}
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div
          className={`
            fixed top-0 left-0 h-full z-40
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10
          `}
        >
          <button
            className="absolute top-4 right-4 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
          <Sidebar activeItem="Dashboard" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb crumbs={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "Notifications" },
          ]} />

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

          <NotificationFilterTabs active={activeTab} onChange={setActiveTab} />

          {notifsLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#E2554F]" size={32} />
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {!notifsLoading && !error && (
            <>
              <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
                {GROUPS.map((group) => {
                  const groupItems = visible.filter((n) => n.group === group);
                  if (groupItems.length === 0) return null;
                  return (
                    <div key={group}>
                      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                        <h3 className="m-0 text-[15px] font-bold text-[#1a1a2e]">{group}</h3>
                      </div>
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

                {visible.length === 0 && (
                  <div className="p-10 text-center text-gray-500 text-[14px]">
                    No notifications found.
                  </div>
                )}
              </div>

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
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Notifications;