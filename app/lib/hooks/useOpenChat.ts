import { useRouter } from "next/navigation";
import { useMessageStore } from "../stores/messageStore";
import { generateId } from "../utils/generateId";

export const useOpenChat = () => {
  const router = useRouter();
  const { addOrUpdateConversation, setActiveConversation } = useMessageStore();

  const openDM = (user: {
    id: string;
    name: string;
    avatar: string;
    isOnline?: boolean;
  }) => {
    const id = user.id ?? generateId("dm");

    // Always add/update so list keeps growing
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

    setActiveConversation(id); // 👈 always update active ID
    router.push(`/creative/messages/${id}`);
  };

  const openGroup = (project: {
    id: string;
    title: string;
    members: { name: string; avatar: string }[];
  }) => {
    const id = project.id ?? generateId("group");

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

    setActiveConversation(id); // 👈 always update active ID
    router.push(`/creative/messages/${id}`);
  };

  return { openDM, openGroup };
};