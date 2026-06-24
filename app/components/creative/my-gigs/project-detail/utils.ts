export const getDueIn = (dueDate: string): string => {
  const diff = new Date(dueDate).getTime() - Date.now();
  if (diff <= 0) return "Overdue";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${days} days ${String(hours).padStart(2, "0")} hrs ${String(mins).padStart(2, "0")} mins`;
};

export const statusColorMap: Record<string, string> = {
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-600",
  REVISION: "bg-orange-100 text-orange-600",
  PENDING_PAYMENT: "bg-blue-100 text-blue-600",
  PARTIALLY_COMPLETED: "bg-purple-100 text-purple-600",
};

export const statusLabelMap: Record<string, string> = {
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  REVISION: "Revision",
  PENDING_PAYMENT: "Pending Payment",
  PARTIALLY_COMPLETED: "Partially Completed",
};

export const formatDate = (date: string | null | undefined): string => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};