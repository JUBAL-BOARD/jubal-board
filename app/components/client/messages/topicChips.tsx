// app/components/client/messages/clientTopicChips.tsx
"use client";
import { useState } from "react";
import { clientTopics, Topic } from "../../../lib/topic";
import { ChevronLeft } from "lucide-react";

type Props = {
  onSelect: (topic: Topic, breadcrumb: string) => void;
};

export default function ClientTopicChips({ onSelect }: Props) {
  const [history, setHistory] = useState<Topic[]>([]);
  const current = history[history.length - 1];
  const visibleTopics = current?.subtopics ?? clientTopics;

  const handleChipClick = (topic: Topic) => {
    const breadcrumb = [...history.map((t) => t.label), topic.label].join(" > ");

    // Always send as message first
    onSelect(topic, breadcrumb);

    // Then drill down if it has subtopics
    if (topic.subtopics?.length) {
      setHistory((prev) => [...prev, topic]);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2 py-1">
      {history.length > 0 && (
        <button
          onClick={() => setHistory((prev) => prev.slice(0, -1))}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors mr-1"
        >
          <ChevronLeft size={13} />
          Back
        </button>
      )}
      <div className="flex flex-wrap justify-end gap-2 max-w-[85%]">
        {visibleTopics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => handleChipClick(topic)}
            className="rounded-full border border-orange-400 bg-orange-50 px-4 py-2 text-sm text-orange-600 font-medium hover:bg-orange-400 hover:text-white transition-all"
          >
            {topic.label}
          </button>
        ))}
      </div>
    </div>
  );
}