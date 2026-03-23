import { TodoItem } from "@/app/types";

export default function TodoList({ todos }: { todos: TodoItem[] }) {
  return (
    <section className="mb-8 bg-[#fafafa] p-4 lg:p-6">
      <h3 className="text-xl lg:text-3xl font-bold text-gray-900 mb-4">Your To-Do</h3>

      {/* Horizontal scroll on mobile, 2-col grid on desktop */}
      <div className="flex gap-4 overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-2 pb-2 lg:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex-shrink-0 w-[75vw] sm:w-[55vw] lg:w-auto snap-start bg-white border border-gray-100 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-700 font-medium">{todo.title}</p>
              <button className="bg-[#E2554F] hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                Continue
              </button>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E2554F] rounded-full"
                style={{ width: `${todo.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{todo.progress}%</p>
          </div>
        ))}
      </div>
    </section>
  );
}