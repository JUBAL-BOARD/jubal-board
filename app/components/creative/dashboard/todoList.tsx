import { useTodos } from "@/app/lib/hooks/useTodos";
import { useRouter } from "next/navigation";

export default function TodoList() {
  const { todos, loading, error } = useTodos();
  const router = useRouter();

  const incompleteTodos = todos.filter((t) => !t.isCompleted).slice(0, 2);

  return (
    <section className="mb-8 bg-[#fafafa] p-4 lg:p-6">
      <h3 className="text-xl lg:text-3xl font-heading font-bold text-gray-900 mb-4">Your To-Do</h3>

      {loading && <p className="text-sm text-gray-400">Loading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && incompleteTodos.length === 0 && (
        <p className="text-sm text-black">You're all caught up! 🎉</p>
      )}

      <div className="flex gap-4 overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-2 pb-2 lg:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">
        {incompleteTodos.map((todo) => (
          <div
            key={todo.id}
            className="flex-shrink-0 w-[75vw] sm:w-[55vw] lg:w-auto snap-start bg-white border border-gray-100 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-700 font-medium">{todo.title}</p>
              <button
                onClick={() => router.push("/creative/settings")}
                className="bg-[#E2554F] hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                {todo.actionLabel}
              </button>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#E2554F] rounded-full w-0" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Incomplete</p>
          </div>
        ))}
      </div>
    </section>
  );
}