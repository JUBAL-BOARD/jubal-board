"use client";
import { useState } from "react";
import { X } from "lucide-react";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import MessagesContent from "@/app/components/creative/messages/messagesContent";

const MessagesPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <DashboardTopbar
        userName="Natasha John"
        userAvatar="https://i.pravatar.cc/150?img=47"
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Dark overlay — mobile only */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
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
          <Sidebar activeItem="Messages" />
        </div>

        {/* Main */}
        <main className="flex-1 w-full h-screen overflow-hidden p-6 flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Messages</h1>
          <MessagesContent
            showChat={showChat}
            onSelectConversation={() => setShowChat(true)}
            onBack={() => setShowChat(false)}
          />
        </main>
      </div>
    </div>
  );
};

export default MessagesPage;