import Image from "next/image";
import { Star } from "lucide-react";
import type { Notification } from "../../../data/notificationsData";

interface Props {
  notification: Notification;
  onRead: (id: number) => void;
}

const NotificationItem: React.FC<Props> = ({ notification, onRead }) => {
  const isUnread = !notification.read;

  return (
    <div
      onClick={() => onRead(notification.id)}
      className={`flex items-start gap-3.5 px-5 py-4 border-b border-gray-100 cursor-pointer transition-colors duration-150 relative
        ${isUnread ? "bg-[#FAFAFA]" : "bg-white"}`}
    >
      {/* Unread Dot */}
      {isUnread && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#E2554F]" />
      )}

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Image
          src={notification.avatar}
          alt="avatar"
          width={48}
          height={48}
          className="rounded-full object-cover"
        />
        <div className="absolute bottom-px right-px w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`m-0 mb-0.5 text-[14px] text-[#1a1a2e] ${isUnread ? "font-bold" : "font-medium"}`}>
          {notification.title}
        </p>

        {notification.subtitle && (
          <p className="m-0 mb-1 text-[13px] text-gray-700">{notification.subtitle}</p>
        )}

        {/* Stars for review type */}
        {notification.type === "review" && (
          <div className="flex items-center gap-1.5 mb-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={13}
                  fill={star <= (notification.rating ?? 0) ? "#F59E0B" : "none"}
                  stroke="#F59E0B"
                  strokeWidth={1.5}
                />
              ))}
            </div>
            {notification.quote && (
              <span className="text-xs text-gray-500">{notification.quote}</span>
            )}
          </div>
        )}

        <p className="m-0 text-xs text-[#E85D3A] font-medium">{notification.time}</p>
      </div>

    </div>
  );
};

export default NotificationItem;