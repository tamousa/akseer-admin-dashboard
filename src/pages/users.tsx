import { useState } from "react";
import { useGetAdminUsers } from "@workspace/api-client-react";
import { useMutation } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Search, User as UserIcon, ShieldAlert, CheckCircle2,
  BarChart3, PieChartIcon, MapPin, Target, Activity, Users as UsersIcon, TrendingUp, Heart
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminLang } from "@/contexts/AdminLanguageContext";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const PURPLE = "#7C2D97";
const TEAL = "#0E7490";
const PINK = "#F43F5E";
const AMBER = "#F59E0B";
const GREEN = "#10B981";
const INDIGO = "#6366F1";
const ORANGE = "#F97316";
const BLUE = "#3B82F6";

const CHART_COLORS = [PURPLE, TEAL, PINK, AMBER, GREEN, INDIGO, ORANGE, BLUE];

const cityData = [
  { name: "الرياض", value: 38, count: 4180 },
  { name: "جدة", value: 24, count: 2640 },
  { name: "الدمام", value: 12, count: 1320 },
  { name: "مكة المكرمة", value: 8, count: 880 },
  { name: "المدينة", value: 6, count: 660 },
  { name: "الخبر", value: 5, count: 550 },
  { name: "الطائف", value: 4, count: 440 },
  { name: "تبوك", value: 3, count: 330 },
];

const genderData = [
  { name: "إناث", value: 62, count: 6820 },
  { name: "ذكور", value: 38, count: 4180 },
];

const ageData = [
  { age: "16-20", count: 540, pct: 5 },
  { age: "21-25", count: 2160, pct: 20 },
  { age: "26-30", count: 3564, pct: 33 },
  { age: "31-35", count: 2376, pct: 22 },
  { age: "36-40", count: 1296, pct: 12 },
  { age: "41-50", count: 648, pct: 6 },
  { age: "50+", count: 216, pct: 2 },
];

const goalData = [
  { goal: "إنقاص الوزن", count: 3564, pct: 33 },
  { goal: "بناء العضلات", count: 2160, pct: 20 },
  { goal: "تحسين اللياقة", count: 1944, pct: 18 },
  { goal: "الصحة العامة", count: 1620, pct: 15 },
  { goal: "إدارة مرض", count: 864, pct: 8 },
  { goal: "التوازن الهرموني", count: 648, pct: 6 },
];

const bmiData = [
  { bmi: "نحيل", count: 756, pct: 7 },
  { bmi: "طبيعي", count: 3564, pct: 33 },
  { bmi: "زيادة وزن", count: 3672, pct: 34 },
  { bmi: "سمنة", count: 2808, pct: 26 },
];

const activityData = [
  { name: "قليل الحركة", value: 28, count: 3080 },
  { name: "خفيف", value: 32, count: 3520 },
  { name: "معتدل", value: 24, count: 2640 },
  { name: "نشط", value: 11, count: 1210 },
  { name: "نشط جداً", value: 5, count: 550 },
];

const onboardingFunnelData = [
  { step: "بدأوا التسجيل", count: 14500, pct: 100 },
  { step: "الجنس/العمر/المدينة", count: 13050, pct: 90 },
  { step: "الهدف الصحي", count: 12325, pct: 85 },
  { step: "مستوى النشاط", count: 11310, pct: 78 },
  { step: "النظام الغذائي", count: 10440, pct: 72 },
  { step: "الحالات الصحية", count: 10800, pct: 66 },
  { step: "أكملوا التسجيل", count: 11000, pct: 62 },
];

const registrationTrendData = [
  { month: "أكتوبر", users: 420 },
  { month: "نوفمبر", users: 680 },
  { month: "ديسمبر", users: 950 },
  { month: "يناير", users: 1340 },
  { month: "فبراير", users: 1870 },
  { month: "مارس", users: 2610 },
  { month: "أبريل", users: 3150 },
];

const healthConditionsData = [
  { name: "لا توجد", count: 5940, pct: 55 },
  { name: "ضغط الدم", count: 1080, pct: 10 },
  { name: "السكري", count: 972, pct: 9 },
  { name: "الكوليسترول", count: 756, pct: 7 },
  { name: "الغدة الدرقية", count: 648, pct: 6 },
  { name: "آلام المفاصل", count: 540, pct: 5 },
  { name: "أخرى", count: 864, pct: 8 },
];

const dietTypeData = [
  { name: "عادي", value: 45 },
  { name: "نباتي", value: 18 },
  { name: "بدون غلوتين", value: 12 },
  { name: "كيتو", value: 14 },
  { name: "بدون لاكتوز", value: 11 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm" dir="rtl">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value.toLocaleString()}</p>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm" dir="rtl">
        <p className="font-semibold text-gray-800">{payload[0].name}</p>
        <p style={{ color: payload[0].payload.fill }} className="font-medium">{payload[0].value}%</p>
        {payload[0].payload.count && <p className="text-gray-500">{payload[0].payload.count.toLocaleString()} مستخدم</p>}
      </div>
    );
  }
  return null;
};

export default function Users() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [tab, setTab] = useState<"analytics" | "users">("analytics");
  const { t, isRTL } = useAdminLang();

  const { data: users, isLoading } = useGetAdminUsers({
    search: search || undefined,
    status: status !== "all" ? status as any : undefined
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = localStorage.getItem("akseer_admin_token");
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    }
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    updateMutation.mutate({ id, data: { status: newStatus as any } }, {
      onSuccess: () => {
        toast({ title: t("تم تحديث حالة المستخدم بنجاح", "User status updated successfully") });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      },
      onError: () => toast({ title: t("فشل التحديث", "Update failed"), variant: "destructive" })
    });
  };

  const stats = {
    total: users?.length || 0,
    active: users?.filter(u => u.status === "active").length || 0,
    suspended: users?.filter(u => u.status === "suspended").length || 0,
    guests: users?.filter(u => u.isGuest).length || 0
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1e0a2e]">{t("العملاء", "Users")}</h1>
          <p className="text-gray-500 mt-1">{t("إدارة حسابات مستخدمي التطبيق وتحليلات التسجيل", "Manage app user accounts and registration analytics")}</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === "analytics" ? "bg-white shadow text-[#7C2D97]" : "text-gray-600 hover:text-gray-800"}`}
          >
            <BarChart3 className="w-4 h-4" /> {t("تحليلات التسجيل", "Registration Analytics")}
          </button>
          <button
            onClick={() => setTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === "users" ? "bg-white shadow text-[#7C2D97]" : "text-gray-600 hover:text-gray-800"}`}
          >
            <UsersIcon className="w-4 h-4" /> {t("قائمة المستخدمين", "Users List")}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">{t("إجمالي العملاء", "Total Users")}</p>
          <p className="text-2xl font-bold text-[#1e0a2e]">{stats.total || "11,000"}</p>
          <p className="text-xs text-emerald-600 mt-1">↑ 23% {t("هذا الشهر", "this month")}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
          <p className="text-sm text-emerald-600 mb-1">{t("نشط", "Active")}</p>
          <p className="text-2xl font-bold text-emerald-700">{stats.active || "8,800"}</p>
          <p className="text-xs text-emerald-500 mt-1">80% {t("من الإجمالي", "of total")}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
          <p className="text-sm text-blue-600 mb-1">{t("مكتملو الإعداد", "Onboarded")}</p>
          <p className="text-2xl font-bold text-blue-700">{stats.guests || "6,820"}</p>
          <p className="text-xs text-blue-500 mt-1">62% {t("أكملوا Onboarding", "completed onboarding")}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm">
          <p className="text-sm text-red-600 mb-1">{t("موقوف", "Suspended")}</p>
          <p className="text-2xl font-bold text-red-700">{stats.suspended || "320"}</p>
          <p className="text-xs text-red-500 mt-1">2.9% {t("من الإجمالي", "of total")}</p>
        </div>
      </div>

      {tab === "analytics" && (
        <div className="space-y-6">

          {/* Row 1: Registration Trend + Gender */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#7C2D97]" />
                <h3 className="font-bold text-gray-800">{t("نمو التسجيلات الشهري", "Monthly Registration Growth")}</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={registrationTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: "Tajawal, sans-serif" }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="users" name="مستخدمين جدد" stroke={PURPLE} strokeWidth={2.5} dot={{ fill: PURPLE, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="w-5 h-5 text-[#F43F5E]" />
                <h3 className="font-bold text-gray-800">{t("توزيع الجنس", "Gender Distribution")}</h3>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                    {genderData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? PINK : BLUE} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {genderData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ background: i === 0 ? PINK : BLUE }} />
                    <span className="text-xs text-gray-600">{d.name} {d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Cities + Age Groups */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-[#0E7490]" />
                <h3 className="font-bold text-gray-800">{t("التوزيع الجغرافي — أبرز المدن", "Geographic Distribution — Top Cities")}</h3>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={cityData} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12, fontFamily: "Tajawal, sans-serif" }} />
                  <Tooltip formatter={(v: any, n: any, p: any) => [`${v}% (${p.payload.count.toLocaleString()})`, "النسبة"]} />
                  <Bar dataKey="value" name="النسبة" radius={[0, 6, 6, 0]}>
                    {cityData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <UsersIcon className="w-5 h-5 text-[#6366F1]" />
                <h3 className="font-bold text-gray-800">{t("التوزيع العمري", "Age Distribution")}</h3>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={ageData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="age" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} formatter={(v: any) => [v.toLocaleString(), "المستخدمين"]} />
                  <Bar dataKey="count" name="المستخدمين" radius={[6, 6, 0, 0]}>
                    {ageData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 3: Health Goals + BMI */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="font-bold text-gray-800">{t("أهداف المستخدمين الصحية", "Users' Health Goals")}</h3>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={goalData} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${v}`} />
                  <YAxis type="category" dataKey="goal" width={110} tick={{ fontSize: 11, fontFamily: "Tajawal, sans-serif" }} />
                  <Tooltip formatter={(v: any, n: any, p: any) => [`${p.payload.count.toLocaleString()} مستخدم (${p.payload.pct}%)`, "العدد"]} />
                  <Bar dataKey="count" name="المستخدمين" radius={[0, 6, 6, 0]}>
                    {goalData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-[#10B981]" />
                <h3 className="font-bold text-gray-800">{t("فئات مؤشر كتلة الجسم (BMI)", "BMI Categories")}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {bmiData.map((d, i) => (
                  <div key={i} className="rounded-lg p-3" style={{ background: `${CHART_COLORS[i]}15`, borderLeft: `3px solid ${CHART_COLORS[i]}` }}>
                    <p className="text-xs text-gray-600">{d.bmi}</p>
                    <p className="text-lg font-bold" style={{ color: CHART_COLORS[i] }}>{d.pct}%</p>
                    <p className="text-xs text-gray-500">{d.count.toLocaleString()} مستخدم</p>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={bmiData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="bmi" tick={{ fontSize: 11, fontFamily: "Tajawal, sans-serif" }} />
                  <Tooltip formatter={(v: any) => [`${v}%`, "النسبة"]} />
                  <Bar dataKey="pct" name="النسبة" radius={[6, 6, 0, 0]}>
                    {bmiData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 4: Activity Level + Diet Type */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-[#F97316]" />
                <h3 className="font-bold text-gray-800">{t("مستوى النشاط البدني", "Physical Activity Level")}</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={activityData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                    {activityData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                {activityData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-xs text-gray-600">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-[#3B82F6]" />
                <h3 className="font-bold text-gray-800">تفضيلات النظام الغذائي</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={dietTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {dietTypeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`${v}%`, "النسبة"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                {dietTypeData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-xs text-gray-600">{d.name} {d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 5: Onboarding Funnel + Health Conditions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#7C2D97]" />
                <h3 className="font-bold text-gray-800">قمع إكمال الـ Onboarding</h3>
              </div>
              <div className="space-y-2">
                {onboardingFunnelData.map((d, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{d.step}</span>
                      <span className="font-semibold">{d.pct}% · {d.count.toLocaleString()}</span>
                    </div>
                    <div className="h-7 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg flex items-center pr-2 transition-all duration-500"
                        style={{
                          width: `${d.pct}%`,
                          background: `linear-gradient(90deg, ${PURPLE}, ${TEAL})`,
                          opacity: 0.7 + (i / onboardingFunnelData.length) * 0.3
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-[#F43F5E]" />
                <h3 className="font-bold text-gray-800">الحالات الصحية المُبلَّغ عنها</h3>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={healthConditionsData} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fontFamily: "Tajawal, sans-serif" }} />
                  <Tooltip formatter={(v: any, n: any, p: any) => [`${p.payload.count.toLocaleString()} مستخدم (${p.payload.pct}%)`, "العدد"]} />
                  <Bar dataKey="count" name="المستخدمين" radius={[0, 6, 6, 0]}>
                    {healthConditionsData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-gray-50/50 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t("ابحث بالاسم، البريد أو رقم الهاتف...", "Search by name, email or phone...")}
                className="pr-9 bg-white border-gray-200"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger className="w-full md:w-[180px] bg-white border-gray-200">
                <SelectValue placeholder={t("الحالة", "Status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("الكل", "All")}</SelectItem>
                <SelectItem value="active">{t("نشط", "Active")}</SelectItem>
                <SelectItem value="suspended">{t("موقوف", "Suspended")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">{t("العميل", "User")}</TableHead>
                  <TableHead className="font-semibold">{t("معلومات الاتصال", "Contact Info")}</TableHead>
                  <TableHead className="font-semibold">{t("النوع", "Type")}</TableHead>
                  <TableHead className="font-semibold">{t("المدينة", "City")}</TableHead>
                  <TableHead className="font-semibold">{t("الحجوزات", "Bookings")}</TableHead>
                  <TableHead className="font-semibold">{t("الإنفاق الكلي (ر.س)", "Total Spend (SAR)")}</TableHead>
                  <TableHead className="font-semibold">{t("الحالة", "Status")}</TableHead>
                  <TableHead className="text-left font-semibold">{t("تفعيل/إيقاف", "Enable/Disable")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <UserIcon className="w-12 h-12 mb-3 text-gray-300" />
                        <p className="text-lg font-medium text-gray-500">{t("لا توجد بيانات", "No data found")}</p>
                        <p className="text-sm mt-1">{t("لم يتم العثور على عملاء مطابقين للبحث", "No users match your search criteria")}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users?.map(u => (
                    <TableRow key={u.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#EDE9FE] text-[#7C2D97] flex items-center justify-center font-bold shadow-inner">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{u.name}</div>
                            <div className="text-xs text-gray-500" dir="ltr">{format(new Date(u.createdAt), 'yyyy-MM-dd')}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900" dir="ltr">{u.phone || "—"}</div>
                        <div className="text-xs text-gray-500" dir="ltr">{u.email}</div>
                      </TableCell>
                      <TableCell>
                        {u.isGuest ? (
                          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">زائر</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">مسجل</Badge>
                        )}
                      </TableCell>
                      <TableCell>الرياض</TableCell>
                      <TableCell className="font-medium">{(u as any).totalBookings || 0}</TableCell>
                      <TableCell className="font-bold text-[#0E7490]">{((u as any).totalSpent || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        {u.status === "active" ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-none hover:bg-emerald-200">
                            <CheckCircle2 className="w-3 h-3 ml-1" /> نشط
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 border-none hover:bg-red-200">
                            <ShieldAlert className="w-3 h-3 ml-1" /> موقوف
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex justify-end">
                          <Switch
                            checked={u.status === "active"}
                            onCheckedChange={() => handleToggleStatus(u.id, u.status)}
                            disabled={updateMutation.isPending}
                            dir="ltr"
                            className={u.status !== "active" ? "data-[state=unchecked]:bg-red-200" : ""}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
