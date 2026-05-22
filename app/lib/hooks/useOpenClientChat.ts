import { useRouter } from "next/navigation";
import { useMessageStore } from "../../lib/stores/messageStore";

export const useOpenClientChat = () => {
  const router = useRouter();
  const { addOrUpdateConversation, setActiveConversation } = useMessageStore();

  const openDM = (user: {
    id?: string;
    name: string;
    avatar: string;
    isOnline?: boolean;
  }) => {
    const id = user.id
      ? user.id.startsWith("dm_") ? user.id : `dm_${user.id}`
      : `dm_${user.name.replace(/\s+/g, "_").toLowerCase()}`;

    addOrUpdateConversation({
      id,
      type: "dm",
      name: user.name,
      avatar: user.avatar,
      isOnline: user.isOnline ?? false,
      messages: [],
      lastMessage: "",
      lastTime: "",
      unread: 0,
    });

    setActiveConversation(id);
    router.push(`/client/messages/${id}`); // 👈 client route
  };

  const openGroup = (project: {
    id?: string;
    title: string;
    members: { name: string; avatar: string }[];
  }) => {
    const id = project.id
      ? project.id.startsWith("group_") ? project.id : `group_${project.id}`
      : `group_${project.title.replace(/\s+/g, "_").toLowerCase()}`;

    addOrUpdateConversation({
      id,
      type: "group",
      name: project.title,
      members: project.members,
      messages: [],
      lastMessage: "",
      lastTime: "",
      unread: 0,
    });

    setActiveConversation(id);
    router.push(`/client/messages/${id}`); // 👈 client route
  };

  return { openDM, openGroup };
};