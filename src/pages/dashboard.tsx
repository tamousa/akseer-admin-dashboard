import { useGetAdminStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Store, CheckCircle2, DollarSign, Car, AlertCircle, ArrowLeft, ArrowRight, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { useAdminLang } from "@/contexts/AdminLanguageContext";

const PIE_COLORS = ["#00E0B8", "#00C4A0", "#007A65", "#0EA5E9", "#F59E0B", "#22C55E", "#6366F1"];
const APP_COMMISSION = 0.15;

const fetchPending = async () => {
  const token = localStorage.getItem("akseer_admin_token");
  const headers = { "Authorization": `Bearer ${token}` };
  try {
    const [bizRes, driverRes] = await Promise.all([
      fetch("/api/admin/businesses?status=pending", { headers }),
      fetch("/api/admin/drivers?status=pending", { headers }).catch(() => ({ ok: true, json: () => ({ data: [] }) }))
    ]);
    const biz = bizRes.ok ? await bizRes.json() : { data: [] };
    const drivers = (driverRes as any).ok ? await (driverRes as any).json() : { data: [] };
    const bizData = Array.isArray(biz) ? biz : (biz.data || []);
    const driversData = Array.isArray(drivers) ? drivers : (drivers.data || []);
    return [
      ...bizData.map((b: any) => ({ ...b, entityType: "business" as const })),
      ...driversData.map((d: any) => ({ ...d, entityType: "driver" as const }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    return [];
  }
};

type RevenuePeriod = "second" | "minute" | "hour" | "day" | "week" | "month";

function generatePeriodData(period: RevenuePeriod) {
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);
  switch (period) {
    case "second": return Array.from({ length: 30 }, (_, i) => ({ t: `${i + 1}s`, v: rand(180, 650) }));
    case "minute": return Array.from({ length: 60 }, (_, i) => ({ t: `${i + 1}m`, v: rand(2000, 8500) }));
    case "hour": return Array.from({ length: 24 }, (_, i) => ({ t: `${i}:00`, v: rand(12000, 55000) }));
    case "day": return [
      { t: "Sat", v: 142000 }, { t: "Sun", v: 168000 }, { t: "Mon", v: 135000 },
      { t: "Tue", v: 178000 }, { t: "Wed", v: 192000 }, { t: "Thu", v: 225000 }, { t: "Fri", v: 198000 }
    ];
    case "week": return [
      { t: "Wk 1", v: 920000 }, { t: "Wk 2", v: 1050000 }, { t: "Wk 3", v: 980000 },
      { t: "Wk 4", v: 1120000 }, { t: "Wk 5", v: 1240000 }, { t: "Wk 6", v: 1180000 }
    ];
    case "month": return [
      { t: "Jul", v: 3200000 }, { t: "Aug", v: 3800000 }, { t: "Sep", v: 3500000 },
      { t: "Oct", v: 4100000 }, { t: "Nov", v: 4500000 }, { t: "Dec", v: 5200000 },
      { t: "Jan", v: 4800000 }, { t: "Feb", v: 5100000 }, { t: "Mar", v: 5600000 }
    ];
    default: return [];
  }
}

function getCurrentRevenue(period: RevenuePeriod, data: { t: string; v: number }[]) {
  const last = data[data.length - 1]?.v || 0;
  const prev = data[data.length - 2]?.v || last;
  const change = prev > 0 ? ((last - prev) / prev) * 100 : 0;
  return { value: last, change, prev };
}

const CATEGORY_LABELS_EN: Record<string, string> = {
  clinic: "Clinic", lab: "Lab", pharmacy: "Pharmacy", spa: "Spa",
  gym: "Gym", rehab: "Rehab", store: "Store", other: "Other"
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [period, setPeriod] = useState<RevenuePeriod>("day");
  const [periodData, setPeriodData] = useState(() => generatePeriodData("day"));
  const { t, lang, isRTL } = useAdminLang();

  const PERIOD_LABELS: Record<RevenuePeriod, string> = {
    second: t("ثانية", "Second"),
    minute: t("دقيقة", "Minute"),
    hour: t("ساعة", "Hour"),
    day: t("يومي", "Daily"),
    week: t("أسبوعي", "Weekly"),
    month: t("شهري", "Monthly")
  };

  const PERIOD_UNIT: Record<RevenuePeriod, string> = {
    second: t("ثانية", "sec"),
    minute: t("دقيقة", "min"),
    hour: t("ساعة", "hr"),
    day: t("يوم", "day"),
    week: t("أسبوع", "week"),
    month: t("شهر", "month")
  };

  const PERIOD_DESC: Record<RevenuePeriod, string> = {
    second: t("متوسط الإيراد لكل ثانية (محاكاة مباشرة)", "Revenue per second (live simulation)"),
    minute: t("متوسط الإيراد كل دقيقة", "Average revenue per minute"),
    hour: t("إيراد كل ساعة على مدار اليوم", "Hourly revenue throughout the day"),
    day: t("الإيراد اليومي لآخر 7 أيام", "Daily revenue for the last 7 days"),
    week: t("الإيراد الأسبوعي لآخر 6 أسابيع", "Weekly revenue for the last 6 weeks"),
    month: t("الإيراد الشهري لآخر 9 أشهر", "Monthly revenue for the last 9 months")
  };

  const growthData = [
    { name: t("أكتوبر", "Oct"), users: 4200 },
    { name: t("نوفمبر", "Nov"), users: 5100 },
    { name: t("ديسمبر", "Dec"), users: 4800 },
    { name: t("يناير", "Jan"), users: 6300 },
    { name: t("فبراير", "Feb"), users: 8100 },
    { name: t("مارس", "Mar"), users: 9800 },
  ];

  const { data: stats, isLoading } = useGetAdminStats({ query: { queryKey: ["adminStats"] } });
  const { data: pendingItems, isLoading: pendingLoading } = useQuery({
    queryKey: ["pendingApprovals"],
    queryFn: fetchPending,
  });

  const refreshData = useCallback(() => {
    setPeriodData(generatePeriodData(period));
  }, [period]);

  useEffect(() => {
    setPeriodData(generatePeriodData(period));
    if (period !== "second") return;
    const interval = setInterval(() => {
      setPeriodData(prev => {
        const newPoint = { t: `${prev.length + 1}s`, v: Math.floor(Math.random() * 470 + 180) };
        return [...prev.slice(-29), newPoint];
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [period]);

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-[120px] rounded-2xl" />)}
      </div>
      <Skeleton className="h-[200px] rounded-2xl" />
      <Skeleton className="h-[360px] rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[360px] rounded-2xl" />
        <Skeleton className="h-[360px] rounded-2xl" />
      </div>
    </div>
  );

  if (!stats) return (
    <div className="text-center p-12 flex flex-col items-center justify-center h-64">
      <AlertCircle className="w-12 h-12 mb-4 text-gray-300" />
      {t("لا توجد بيانات", "No data available")}
    </div>
  );

  const totalPending = (stats.pendingBusinesses || 0) + ((stats as any).pendingDrivers || 0);
  const monthlyRevenue = stats.monthlyRevenue || 0;
  const appCommission = Math.round(monthlyRevenue * APP_COMMISSION);

  const kpis = [
    { title: t("إجمالي المستخدمين", "Total Users"), value: (stats.totalUsers || 0).toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: t("المنشآت النشطة", "Active Businesses"), value: (stats.activeBusinesses || 0).toLocaleString(), icon: Store, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: t("انتظار الموافقة", "Pending Approval"), value: totalPending.toLocaleString(), icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50", onClick: () => setLocation("/businesses?status=pending"), clickable: true },
    { title: t("الإيراد الشهري", "Monthly Revenue"), value: `${monthlyRevenue.toLocaleString()} ${t("ر.س", "SAR")}`, icon: DollarSign, color: "text-teal-600", bg: "bg-teal-50" },
    { title: t("عمولة أكسير (15%)", "Akseer Commission (15%)"), value: `${appCommission.toLocaleString()} ${t("ر.س", "SAR")}`, icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50", onClick: () => setLocation("/settlements"), clickable: true },
  ];

  const { value: currentRev, change } = getCurrentRevenue(period, periodData);
  const isUp = change >= 0;

  const pieData = stats.businessesByCategory?.map((item: any) => ({
    name: lang === "ar" ? (CATEGORY_LABELS[item.category] || item.category) : (CATEGORY_LABELS_EN[item.category] || item.category),
    value: item.count
  })) || [{ name: t("لا يوجد", "None"), value: 1 }];

  const topBusinesses = [
    { nameAr: "عيادات ابتسامة النجوم", nameEn: "Star Smile Clinics", category: "clinic", revenue: 85200 },
    { nameAr: "مركز وقت اللياقة", nameEn: "Fitness Time Center", category: "rehab", revenue: 52400 },
    { nameAr: "صيدلية الشفاء", nameEn: "Al-Shifa Pharmacy", category: "store", revenue: 38900 },
    { nameAr: "مختبرات البرج المرجاني", nameEn: "Coral Tower Labs", category: "lab", revenue: 31500 },
    { nameAr: "سبا فندق الأمير", nameEn: "Prince Hotel Spa", category: "spa", revenue: 27800 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* Row 1: KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {kpis.map((kpi, i) => (
          <Card
            key={i}
            className={`border-none shadow-sm ${kpi.clickable ? "cursor-pointer hover:shadow-md active:scale-[0.98] transition-all" : ""}`}
            onClick={kpi.onClick}
          >
            <CardContent className="p-4 md:p-5 flex items-center gap-3">
              <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 md:w-6 md:h-6 ${kpi.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 mb-0.5 truncate">{kpi.title}</p>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">{kpi.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2: Revenue by period */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#007A65]" />
                {t("تحليل الإيرادات", "Revenue Analysis")}
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">{PERIOD_DESC[period]}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(PERIOD_LABELS) as RevenuePeriod[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    period === p ? "bg-[#007A65] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {PERIOD_LABELS[p]}
                  {p === "second" && period === "second" && (
                    <span className="ms-1 w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-48 shrink-0 bg-gradient-to-br from-[#0D1B2A] to-[#07564A] rounded-xl p-5 text-white flex flex-col justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">{t("الإيراد /", "Revenue /")} {PERIOD_UNIT[period]}</p>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                  {period === "month" || period === "week"
                    ? `${(currentRev / 1000000).toFixed(2)}M`
                    : period === "day"
                    ? `${(currentRev / 1000).toFixed(0)}K`
                    : currentRev.toLocaleString()}
                </h2>
                <p className="text-white/50 text-xs mt-1">{t("ريال سعودي", "Saudi Riyal")}</p>
              </div>
              <div className={`flex items-center gap-1.5 mt-4 text-sm font-medium ${isUp ? "text-green-400" : "text-red-400"}`}>
                {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{Math.abs(change).toFixed(1)}% {isUp ? t("ارتفاع", "up") : t("انخفاض", "down")}</span>
              </div>
              {period === "second" && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-xs text-white/60">{t("مباشر", "Live")}</span>
                </div>
              )}
            </div>

            <div className="flex-1 h-[200px] md:h-[220px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={periodData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007A65" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#007A65" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 10 }} interval={period === "minute" ? 9 : period === "second" ? 4 : "preserveStartEnd"} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 10 }} tickFormatter={v => period === "month" || period === "week" ? `${(v / 1000000).toFixed(1)}M` : `${Math.round(v / 1000)}K`} width={40} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", fontSize: 12 }}
                    formatter={(v: number) => [`${v.toLocaleString()} ${t("ر.س", "SAR")}`, t("الإيراد", "Revenue")]}
                  />
                  <Area type="monotone" dataKey="v" stroke="#007A65" strokeWidth={2.5} fill="url(#revenueGradient)" dot={false} activeDot={{ r: 4, fill: "#007A65" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: t("أعلى قيمة", "Highest"), value: Math.max(...periodData.map(d => d.v)).toLocaleString() + " " + t("ر.س", "SAR") },
              { label: t("أدنى قيمة", "Lowest"), value: Math.min(...periodData.map(d => d.v)).toLocaleString() + " " + t("ر.س", "SAR") },
              { label: t("المتوسط", "Average"), value: Math.round(periodData.reduce((s, d) => s + d.v, 0) / periodData.length).toLocaleString() + " " + t("ر.س", "SAR") }
            ].map((stat, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                <p className="font-bold text-sm text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Row 3: Pending Approvals */}
      <Card className="border-none shadow-sm border-t-4 border-t-amber-400">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-lg">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              {t("طلبات تنتظر موافقتك", "Pending Your Approval")}
            </span>
            {totalPending > 0 && (
              <Badge className="bg-amber-100 text-amber-800 border-none font-bold">
                {totalPending} {t("طلب", "requests")}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (pendingItems?.length || 0) === 0 ? (
            <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              {t("لا توجد طلبات معلقة حالياً", "No pending requests at the moment")}
            </div>
          ) : (
            <div className="divide-y">
              {pendingItems?.slice(0, 5).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between py-3 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="outline" className={`shrink-0 border-none text-xs ${item.entityType === "business" ? "bg-blue-50 text-blue-700" : "bg-teal-50 text-teal-700"}`}>
                      {item.entityType === "business" ? t("منشأة", "Business") : t("سائق", "Driver")}
                    </Badge>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{item.nameAr || item.name}</p>
                      <p className="text-xs text-gray-500 truncate">{item.city} • {new Date(item.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link href={item.entityType === "business" ? `/businesses/${item.id}` : "/drivers"}>
                      <button className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md text-xs font-medium transition-colors flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t("عرض", "View")}
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
              {(pendingItems?.length || 0) > 5 && (
                <div className="pt-3 text-center">
                  <Link href="/businesses?status=pending" className="text-sm font-medium text-[#007A65] hover:underline flex items-center justify-center gap-1">
                    {t("عرض الكل", "View All")} {isRTL ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Row 4: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t("نمو المستخدمين", "User Growth")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C4A0" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00C4A0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                  <Area type="monotone" dataKey="users" stroke="#007A65" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t("توزيع المنشآت حسب الفئة", "Businesses by Category")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-4">
            <div className="h-[280px] w-full max-w-[220px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value">
                    {pieData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 shrink-0">
              {pieData.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                  <span className="text-gray-600">{entry.name}</span>
                  <span className="font-bold ms-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Top businesses */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t("أعلى المنشآت إيراداً هذا الشهر", "Top Revenue Businesses This Month")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topBusinesses.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm text-[#007A65] font-bold border border-gray-100 shrink-0 text-sm">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{lang === "ar" ? item.nameAr : item.nameEn}</p>
                  <p className="text-xs text-gray-500">
                    {lang === "ar" ? (CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] || item.category) : (CATEGORY_LABELS_EN[item.category] || item.category)}
                  </p>
                </div>
                <div className={`${isRTL ? "text-left" : "text-right"} shrink-0`}>
                  <p className="font-bold text-[#0E7490] text-sm">{item.revenue.toLocaleString()} {t("ر.س", "SAR")}</p>
                  <p className="text-xs text-emerald-600">{(item.revenue * 0.85).toLocaleString()} {t("صافي", "net")}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
