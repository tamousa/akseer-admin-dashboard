export const CATEGORY_LABELS: Record<string, string> = {
  store: "متجر", 
  clinic: "عيادة", 
  lab: "مختبر", 
  beauty: "تجميل", 
  cupping: "حجامة", 
  spa: "سبا", 
  rehab: "تأهيل"
};

export const CATEGORY_COLORS: Record<string, string> = {
  store: "bg-[#7C3AED]/10 text-[#7C3AED]",
  clinic: "bg-[#0E7490]/10 text-[#0E7490]",
  lab: "bg-[#0369A1]/10 text-[#0369A1]",
  beauty: "bg-[#BE185D]/10 text-[#BE185D]",
  cupping: "bg-[#92400E]/10 text-[#92400E]",
  spa: "bg-[#6366F1]/10 text-[#6366F1]",
  rehab: "bg-[#059669]/10 text-[#059669]"
};

export const STATUS_LABELS: Record<string, string> = {
  active: "نشط", 
  inactive: "غير نشط", 
  pending: "قيد الانتظار", 
  suspended: "موقوف"
};

export const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200",
  inactive: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200",
  suspended: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200"
};

export const PLAN_LABELS: Record<string, string> = {
  free: "مجاني", 
  basic: "أساسي", 
  premium: "مميز"
};

export const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-700 border-gray-200",
  basic: "bg-blue-100 text-blue-700 border-blue-200",
  premium: "bg-amber-100 text-amber-700 border-amber-200"
};
