import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Banknote, Store, Car, TrendingUp, CheckCircle2, Clock, Search, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/constants";
import { useAdminLang } from "@/contexts/AdminLanguageContext";

const APP_COMMISSION = 0.15;
const DELIVERY_COMMISSION = 0.20;

const businessSettlements = [
  { id: "1", nameAr: "عيادات ابتسامة النجوم", nameEn: "Star Smile Clinics", category: "clinic", orders: 142, grossRevenue: 85200, status: "pending", lastSettled: "2026-03-01" },
  { id: "2", nameAr: "مركز وقت اللياقة", nameEn: "Fitness Time Center", category: "rehab", orders: 98, grossRevenue: 52400, status: "pending", lastSettled: "2026-03-01" },
  { id: "3", nameAr: "صيدلية الشفاء", nameEn: "Al-Shifa Pharmacy", category: "store", orders: 215, grossRevenue: 38900, status: "pending", lastSettled: "2026-03-01" },
  { id: "4", nameAr: "مختبرات البرج المرجاني", nameEn: "Coral Tower Labs", category: "lab", orders: 67, grossRevenue: 31500, status: "settled", lastSettled: "2026-03-15" },
  { id: "5", nameAr: "سبا فندق الأمير", nameEn: "Prince Hotel Spa", category: "spa", orders: 44, grossRevenue: 27800, status: "settled", lastSettled: "2026-03-15" },
  { id: "6", nameAr: "مركز حجامة الشفاء", nameEn: "Al-Shifa Cupping Center", category: "cupping", orders: 89, grossRevenue: 22600, status: "pending", lastSettled: "2026-03-01" },
  { id: "7", nameAr: "صالون هيلة للتجميل", nameEn: "Haila Beauty Salon", category: "beauty", orders: 113, grossRevenue: 18900, status: "settled", lastSettled: "2026-03-15" },
  { id: "8", nameAr: "متجر العافية الصحي", nameEn: "Al-Afia Health Store", category: "store", orders: 76, grossRevenue: 15300, status: "pending", lastSettled: "2026-03-01" },
];

const driverSettlements = [
  { id: "1", name: "فهد القحطاني", vehicleTypeAr: "سيارة", vehicleTypeEn: "Car", deliveries: 87, deliveryRevenue: 4350, status: "pending" },
  { id: "2", name: "عبدالرحمن العمري", vehicleTypeAr: "دراجة نارية", vehicleTypeEn: "Motorcycle", deliveries: 134, deliveryRevenue: 6700, status: "pending" },
  { id: "3", name: "ماجد الشهري", vehicleTypeAr: "سيارة", vehicleTypeEn: "Car", deliveries: 62, deliveryRevenue: 3100, status: "settled" },
  { id: "4", name: "خالد الحربي", vehicleTypeAr: "سيارة", vehicleTypeEn: "Car", deliveries: 98, deliveryRevenue: 4900, status: "settled" },
  { id: "5", name: "سعد المطيري", vehicleTypeAr: "دراجة نارية", vehicleTypeEn: "Motorcycle", deliveries: 45, deliveryRevenue: 2250, status: "pending" },
];

const CATEGORY_LABELS_EN: Record<string, string> = {
  clinic: "Clinic", lab: "Lab", pharmacy: "Pharmacy", spa: "Spa",
  gym: "Gym", rehab: "Rehab", store: "Store", cupping: "Cupping", beauty: "Beauty", other: "Other"
};

export default function Settlements() {
  const { t, lang, isRTL } = useAdminLang();
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const pendingBiz = businessSettlements.filter(b => b.status === "pending");
  const pendingDrivers = driverSettlements.filter(d => d.status === "pending");

  const totalGross = businessSettlements.reduce((s, b) => s + b.grossRevenue, 0);
  const totalCommission = Math.round(totalGross * APP_COMMISSION);
  const totalNetBiz = totalGross - totalCommission;
  const totalDeliveryRevenue = driverSettlements.reduce((s, d) => s + d.deliveryRevenue, 0);
  const totalNetDrivers = Math.round(totalDeliveryRevenue * (1 - DELIVERY_COMMISSION));

  const handleSettle = (_type: string, _id: string, name: string) => {
    toast({ title: `✅ ${t("تم تحويل المبلغ لـ", "Amount transferred to")} "${name}" ${t("بنجاح", "successfully")}` });
  };

  const handleBulkSettle = () => {
    toast({ title: `✅ ${t("تم تحويل", "Transferred")} ${pendingBiz.length} ${t("تسوية للمنشآت بنجاح", "business settlements successfully")}` });
  };

  const filteredBiz = businessSettlements.filter(b => {
    const name = lang === "ar" ? b.nameAr : b.nameEn;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const distributionData = [
    { name: t("صافي المنشآت (85%)", "Net Businesses (85%)"), value: 85, fill: "#059669" },
    { name: t("عمولة أكسير (15%)", "Akseer Commission (15%)"), value: 15, fill: "#007A65" },
  ];

  const monthlyData = [
    { month: t("أكتوبر", "Oct"), businesses: 285000, drivers: 42000, commission: 50000 },
    { month: t("نوفمبر", "Nov"), businesses: 312000, drivers: 48000, commission: 55000 },
    { month: t("ديسمبر", "Dec"), businesses: 380000, drivers: 57000, commission: 67000 },
    { month: t("يناير", "Jan"), businesses: 298000, drivers: 44000, commission: 53000 },
    { month: t("فبراير", "Feb"), businesses: 325000, drivers: 49000, commission: 57000 },
    { month: t("مارس", "Mar"), businesses: 352000, drivers: 53000, commission: 62000 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0D1B2A]">{t("التسويات المالية", "Financial Settlements")}</h1>
          <p className="text-gray-500 mt-1">{t("إدارة توزيع الإيرادات وتحويل المبالغ للمنشآت والكباتن", "Manage revenue distribution and transfers to businesses and drivers")}</p>
        </div>
        <Button onClick={handleBulkSettle} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {t("تسوية جميع المعلقة", "Settle All Pending")} ({pendingBiz.length})
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-gradient-to-br from-[#0D1B2A] to-[#07564A] text-white">
          <CardContent className="p-5">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-[#C084FC]" />
            </div>
            <p className="text-white/70 text-sm mb-1">{t("إجمالي المبيعات", "Total Sales")}</p>
            <h3 className="text-2xl font-bold">{totalGross.toLocaleString()}</h3>
            <p className="text-white/50 text-xs mt-1">{t("ريال سعودي", "Saudi Riyal")}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-teal-600 to-emerald-700 text-white">
          <CardContent className="p-5">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-3">
              <Banknote className="w-5 h-5 text-white" />
            </div>
            <p className="text-white/80 text-sm mb-1">{t("عمولة أكسير (15%)", "Akseer Commission (15%)")}</p>
            <h3 className="text-2xl font-bold">{totalCommission.toLocaleString()}</h3>
            <p className="text-white/60 text-xs mt-1">{t("ريال سعودي", "SAR")}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
          <CardContent className="p-5">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-3">
              <Store className="w-5 h-5 text-white" />
            </div>
            <p className="text-white/80 text-sm mb-1">{t("صافي المنشآت (85%)", "Net Businesses (85%)")}</p>
            <h3 className="text-2xl font-bold">{totalNetBiz.toLocaleString()}</h3>
            <p className="text-white/60 text-xs mt-1">{t("ريال سعودي", "SAR")}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600 to-sky-700 text-white">
          <CardContent className="p-5">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-3">
              <Car className="w-5 h-5 text-white" />
            </div>
            <p className="text-white/80 text-sm mb-1">{t("صافي الكباتن (80%)", "Net Drivers (80%)")}</p>
            <h3 className="text-2xl font-bold">{totalNetDrivers.toLocaleString()}</h3>
            <p className="text-white/60 text-xs mt-1">{t("ريال سعودي", "SAR")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Banner */}
      <div className="bg-[#E4F8F5] border border-[#C084FC]/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <h4 className="font-bold text-[#0D1B2A] mb-1">{t("آلية توزيع الإيرادات", "Revenue Distribution Model")}</h4>
          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#007A65] inline-block"></span> {t("أكسير تأخذ", "Akseer takes")} <strong>15%</strong> {t("عمولة من كل حجز", "commission per booking")}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> {t("المنشأة تحصل على", "Business receives")} <strong>85%</strong> {t("صافي", "net")}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> {t("الكابتن يحصل على", "Driver receives")} <strong>80%</strong> {t("من رسوم التوصيل", "of delivery fees")}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span> {t("أكسير", "Akseer")} <strong>20%</strong> {t("من رسوم التوصيل", "of delivery fees")}</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("توزيع إيرادات الحجوزات", "Booking Revenue Distribution")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[200px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value">
                    {distributionData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 mt-2">
              {distributionData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }}></span>
                  <span className="text-gray-600">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("التسويات الشهرية (ر.س)", "Monthly Settlements (SAR)")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} tickFormatter={v => `${v / 1000}K`} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "none" }} formatter={(v: number, name: string) => [`${v.toLocaleString()} ${t("ر.س", "SAR")}`, name === "businesses" ? t("منشآت", "Businesses") : name === "drivers" ? t("كباتن", "Drivers") : t("عمولة أكسير", "Akseer Commission")]} />
                  <Bar dataKey="businesses" fill="#059669" radius={[3, 3, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="drivers" fill="#2563EB" radius={[3, 3, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="commission" fill="#007A65" radius={[3, 3, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settlement Tables */}
      <Tabs defaultValue="businesses">
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="businesses" className="gap-2">
            <Store className="w-4 h-4" /> {t("تسويات المنشآت", "Business Settlements")}
            {pendingBiz.length > 0 && <Badge className="bg-amber-500 text-white border-none text-xs px-1.5 py-0 h-5">{pendingBiz.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="drivers" className="gap-2">
            <Car className="w-4 h-4" /> {t("تسويات الكباتن", "Driver Settlements")}
            {pendingDrivers.length > 0 && <Badge className="bg-amber-500 text-white border-none text-xs px-1.5 py-0 h-5">{pendingDrivers.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="businesses" className="mt-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative flex-1">
                  <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                  <Input placeholder={t("ابحث عن منشأة...", "Search business...")} className={`${isRTL ? "pr-9" : "pl-9"} bg-gray-50 border-gray-200`} value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Button variant="outline" size="sm" className="gap-2 shrink-0">
                  <Download className="w-4 h-4" /> {t("تصدير CSV", "Export CSV")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold">{t("المنشأة", "Business")}</TableHead>
                      <TableHead className="font-semibold">{t("الطلبات", "Orders")}</TableHead>
                      <TableHead className="font-semibold">{t("الإيراد الإجمالي", "Gross Revenue")}</TableHead>
                      <TableHead className="font-semibold text-[#007A65]">{t("عمولة أكسير (15%)", "Akseer (15%)")}</TableHead>
                      <TableHead className="font-semibold text-emerald-700">{t("المبلغ المستحق (85%)", "Net Amount (85%)")}</TableHead>
                      <TableHead className="font-semibold">{t("الحالة", "Status")}</TableHead>
                      <TableHead className="font-semibold">{t("إجراء", "Action")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBiz.map(b => {
                      const commission = Math.round(b.grossRevenue * APP_COMMISSION);
                      const net = b.grossRevenue - commission;
                      const name = lang === "ar" ? b.nameAr : b.nameEn;
                      const catLabel = lang === "ar" ? (CATEGORY_LABELS[b.category] || b.category) : (CATEGORY_LABELS_EN[b.category] || b.category);
                      return (
                        <TableRow key={b.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="w-2 h-8 rounded-full" style={{ background: b.status === "pending" ? "#F59E0B" : "#10B981" }}></div>
                              <div>
                                <p className="font-semibold text-sm">{name}</p>
                                <Badge className={`text-xs border-none ${CATEGORY_COLORS[b.category] || "bg-gray-100 text-gray-700"}`}>{catLabel}</Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{b.orders}</TableCell>
                          <TableCell className="font-medium">{b.grossRevenue.toLocaleString()} {t("ر.س", "SAR")}</TableCell>
                          <TableCell className="text-[#007A65] font-bold">{commission.toLocaleString()} {t("ر.س", "SAR")}</TableCell>
                          <TableCell className="text-emerald-700 font-bold text-base">{net.toLocaleString()} {t("ر.س", "SAR")}</TableCell>
                          <TableCell>
                            {b.status === "pending" ? (
                              <Badge className="bg-amber-100 text-amber-800 border-none">
                                <Clock className="w-3 h-3 me-1" /> {t("معلقة", "Pending")}
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-100 text-emerald-800 border-none">
                                <CheckCircle2 className="w-3 h-3 me-1" /> {t("مسواة", "Settled")}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {b.status === "pending" ? (
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 px-3 text-xs" onClick={() => handleSettle("business", b.id, name)}>
                                {t("تحويل", "Transfer")} {net.toLocaleString()} {t("ر.س", "SAR")}
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-400">{new Date(b.lastSettled).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex flex-wrap gap-6 text-sm">
                  <span className="text-gray-600">{t("الإجمالي:", "Total:")} <strong className="text-gray-900">{totalGross.toLocaleString()} {t("ر.س", "SAR")}</strong></span>
                  <span className="text-[#007A65]">{t("عمولة أكسير:", "Akseer:")} <strong>{totalCommission.toLocaleString()} {t("ر.س", "SAR")}</strong></span>
                  <span className="text-emerald-700">{t("صافي للمنشآت:", "Net to Businesses:")} <strong>{totalNetBiz.toLocaleString()} {t("ر.س", "SAR")}</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="mt-4">
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold">{t("الكابتن", "Driver")}</TableHead>
                      <TableHead className="font-semibold">{t("عدد التوصيلات", "Deliveries")}</TableHead>
                      <TableHead className="font-semibold">{t("إجمالي رسوم التوصيل", "Total Delivery Fees")}</TableHead>
                      <TableHead className="font-semibold text-[#007A65]">{t("عمولة أكسير (20%)", "Akseer (20%)")}</TableHead>
                      <TableHead className="font-semibold text-blue-700">{t("المبلغ المستحق (80%)", "Net Amount (80%)")}</TableHead>
                      <TableHead className="font-semibold">{t("الحالة", "Status")}</TableHead>
                      <TableHead className="font-semibold">{t("إجراء", "Action")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {driverSettlements.map(d => {
                      const commission = Math.round(d.deliveryRevenue * DELIVERY_COMMISSION);
                      const net = d.deliveryRevenue - commission;
                      return (
                        <TableRow key={d.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                {d.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{d.name}</p>
                                <p className="text-xs text-gray-500">{lang === "ar" ? d.vehicleTypeAr : d.vehicleTypeEn}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{d.deliveries}</TableCell>
                          <TableCell className="font-medium">{d.deliveryRevenue.toLocaleString()} {t("ر.س", "SAR")}</TableCell>
                          <TableCell className="text-[#007A65] font-bold">{commission.toLocaleString()} {t("ر.س", "SAR")}</TableCell>
                          <TableCell className="text-blue-700 font-bold text-base">{net.toLocaleString()} {t("ر.س", "SAR")}</TableCell>
                          <TableCell>
                            {d.status === "pending" ? (
                              <Badge className="bg-amber-100 text-amber-800 border-none">
                                <Clock className="w-3 h-3 me-1" /> {t("معلقة", "Pending")}
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-100 text-emerald-800 border-none">
                                <CheckCircle2 className="w-3 h-3 me-1" /> {t("مسواة", "Settled")}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {d.status === "pending" ? (
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 px-3 text-xs" onClick={() => handleSettle("driver", d.id, d.name)}>
                                {t("تحويل", "Transfer")} {net.toLocaleString()} {t("ر.س", "SAR")}
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-400">{t("تمت التسوية", "Settled")}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg flex flex-wrap gap-6 text-sm">
                <span className="text-gray-600">{t("إجمالي رسوم التوصيل:", "Total Delivery Fees:")} <strong className="text-gray-900">{totalDeliveryRevenue.toLocaleString()} {t("ر.س", "SAR")}</strong></span>
                <span className="text-[#007A65]">{t("عمولة أكسير:", "Akseer:")} <strong>{Math.round(totalDeliveryRevenue * DELIVERY_COMMISSION).toLocaleString()} {t("ر.س", "SAR")}</strong></span>
                <span className="text-blue-700">{t("صافي للكباتن:", "Net to Drivers:")} <strong>{totalNetDrivers.toLocaleString()} {t("ر.س", "SAR")}</strong></span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
