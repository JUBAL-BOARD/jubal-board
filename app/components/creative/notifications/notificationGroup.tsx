import { Star } from "lucide-react";
import { AppNotification } from "@/app/types";

interface Props {
  label: string;
  notifications: AppNotification[];
  readIds: string[];
  onRead: (id: string) => void;
}

const NotificationGroup: React.FC<Props> = ({ label, notifications, readIds, onRead }) => {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-3">{label}</h2>
      <div className="flex flex-col rounded-xl overflow-hidden">
        {notifications.map((notif, i) => {
          const isRead = readIds.includes(notif.id);
          const isLast = i === notifications.length - 1;
          return (
            <div
              key={notif.id}
              onClick={() => onRead(notif.id)}
              className={`flex bg-[#fafafa] items-start gap-8 px-4 py-4 cursor-pointer transition-colors
                ${!isLast ? "border-b border-gray-100" : ""}
                ${isRead ? "bg-white" : "bg-white hover:bg-gray-50"}
              `}
            >
              {/* Avatar */}
              <img
                src={notif.avatar}
                alt={notif.name}
                className="w-11 h-11 rounded-full object-cover flex-shrink-0"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold text-gray-900 mb-0.5 ${!isRead ? "font-bold" : ""}`}>
                  {notif.title}
                </p>

                {/* Subtitle — stars for reviews, plain text for others */}
                {notif.stars ? (
                  <div className="flex items-center gap-1 mb-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={11}
                        className={s <= notif.stars! ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
                      />
                    ))}
                    {notif.subtitle && (
                      <span className="text-xs text-black ml-1">{notif.subtitle}</span>
                    )}
                  </div>
                ) : (
                  notif.subtitle && (
                    <p className="text-xs text-black mb-0.5">{notif.subtitle}</p>
                  )
                )}

                <p className="text-xs text-orange-400 font-medium">{notif.timeAgo}</p>
              </div>

              {/* Unread dot */}
              {!isRead && (
                <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationGroup;