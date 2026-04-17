import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle2, XCircle, MoreVertical, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminLang } from "@/contexts/AdminLanguageContext";

const fetchDrivers = async () => {
  const token = localStorage.getItem("akseer_admin_token");
  const res = await fetch("/api/admin/drivers", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : (data.data || []);
};

const updateDriverStatus = async ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string }) => {
  const token = localStorage.getItem("akseer_admin_token");
  const res = await fetch(`/api/admin/drivers/${id}`, {
    method: "PATCH",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ status, rejectionReason })
  });
  if (!res.ok) throw new Error("Failed to update driver");
  return res.json();
};

export default function Drivers() {
  const { t, lang, isRTL } = useAdminLang();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: drivers, isLoading } = useQuery({ queryKey: ["drivers"], queryFn: fetchDrivers });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [rejectDialog, setRejectDialog] = useState({ open: false, id: "", reason: "" });

  const statusMutation = useMutation({
    mutationFn: updateDriverStatus,
    onSuccess: () => {
      toast({ title: t("تم تحديث حالة السائق بنجاح", "Driver status updated successfully") });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      setRejectDialog({ open: false, id: "", reason: "" });
    },
    onError: () => {
      toast({ title: t("حدث خطأ أثناء التحديث", "An error occurred"), variant: "destructive" });
    }
  });

  const handleApprove = (id: string) => statusMutation.mutate({ id, status: "active" });
  const handleReject = () => statusMutation.mutate({ id: rejectDialog.id, status: "inactive", rejectionReason: rejectDialog.reason });
  const handleToggleStatus = (id: string, current: string) => statusMutation.mutate({ id, status: current === "active" ? "inactive" : "active" });

  const filteredDrivers = drivers?.filter((d: any) => {
    const matchesSearch = d.name?.includes(search) || d.phone?.includes(search);
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    active: drivers?.filter((d: any) => d.status === "active").length || 0,
    pending: drivers?.filter((d: any) => d.status === "pending").length || 0,
    inactive: drivers?.filter((d: any) => d.status === "inactive" || d.status === "suspended").length || 0,
    total: drivers?.length || 0
  };

  const getStatusBadge = (s: string) => {
    const m: Record<string, { ar: string; en: string; cls: string }> = {
      active:    { ar: "نشط",     en: "Active",    cls: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" },
      pending:   { ar: "انتظار",  en: "Pending",   cls: "bg-amber-100 text-amber-800 hover:bg-amber-200" },
      inactive:  { ar: "غير نشط", en: "Inactive",  cls: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
      suspended: { ar: "موقوف",   en: "Suspended", cls: "bg-red-100 text-red-800 hover:bg-red-200" },
    };
    const e = m[s]; if (!e) return null;
    return <Badge className={`${e.cls} border-none shadow-none`}>{lang === "ar" ? e.ar : e.en}</Badge>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1e0a2e]">{t("السائقون", "Drivers")}</h1>
          <p className="text-gray-500 mt-1">{t("إدارة حسابات السائقين وطلبات الانضمام", "Manage driver accounts and join requests")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">{t("إجمالي السائقين", "Total Drivers")}</p>
          <p className="text-2xl font-bold text-[#1e0a2e]">{stats.total}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
          <p className="text-sm text-emerald-600 mb-1">{t("نشط", "Active")}</p>
          <p className="text-2xl font-bold text-emerald-700">{stats.active}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm">
          <p className="text-sm text-amber-600 mb-1">{t("في انتظار الموافقة", "Pending Approval")}</p>
          <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">{t("غير نشط / موقوف", "Inactive / Suspended")}</p>
          <p className="text-2xl font-bold text-gray-700">{stats.inactive}</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-gray-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
            <Input
              placeholder={t("ابحث بالاسم أو رقم الجوال...", "Search by name or phone...")}
              className={`${isRTL ? "pr-9" : "pl-9"} bg-white border-gray-200`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-white border-gray-200">
              <SelectValue placeholder={t("الحالة", "Status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("الكل", "All")}</SelectItem>
              <SelectItem value="active">{t("نشط", "Active")}</SelectItem>
              <SelectItem value="pending">{t("انتظار الموافقة", "Pending Approval")}</SelectItem>
              <SelectItem value="inactive">{t("غير نشط", "Inactive")}</SelectItem>
              <SelectItem value="suspended">{t("موقوف", "Suspended")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold">{t("السائق", "Driver")}</TableHead>
                <TableHead className="font-semibold">{t("المركبة", "Vehicle")}</TableHead>
                <TableHead className="font-semibold">{t("المدينة", "City")}</TableHead>
                <TableHead className="font-semibold">{t("التوصيلات", "Deliveries")}</TableHead>
                <TableHead className="font-semibold">{t("الأرباح", "Earnings")}</TableHead>
                <TableHead className="font-semibold">{t("متصل", "Online")}</TableHead>
                <TableHead className="font-semibold">{t("الحالة", "Status")}</TableHead>
                <TableHead className="font-semibold">{t("الإجراءات", "Actions")}</TableHead>
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
              ) : filteredDrivers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Car className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="text-lg font-medium text-gray-500">{t("لا توجد بيانات", "No data found")}</p>
                      <p className="text-sm mt-1">{t("لم يتم العثور على سائقين مطابقين للبحث", "No drivers match your search")}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDrivers?.map((d: any) => (
                  <TableRow key={d.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-gray-900">{d.name}</div>
                      <div className="text-xs text-gray-500" dir="ltr">{d.phone}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {d.vehicleType === "car" ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{t("سيارة", "Car")}</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">{t("دراجة", "Bike")}</Badge>
                        )}
                        <span className="text-xs text-gray-500 uppercase tracking-widest">{d.plateNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>{d.city}</TableCell>
                    <TableCell className="font-medium">{d.totalTrips || 0}</TableCell>
                    <TableCell className="font-bold text-[#0E7490]">{(d.totalEarnings || 0).toLocaleString()} {t("ر.س", "SAR")}</TableCell>
                    <TableCell>
                      {d.isOnline ? (
                        <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          {t("متصل", "Online")}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-400">
                          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                          {t("غير متصل", "Offline")}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(d.status)}</TableCell>
                    <TableCell>
                      {d.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3" onClick={() => handleApprove(d.id)}>
                            <CheckCircle2 className="w-4 h-4 me-1" /> {t("موافقة", "Approve")}
                          </Button>
                          <Button size="sm" variant="destructive" className="h-8 px-3" onClick={() => setRejectDialog({ open: true, id: d.id, reason: "" })}>
                            <XCircle className="w-4 h-4 me-1" /> {t("رفض", "Reject")}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {d.status === "active" || d.status === "inactive" ? (
                            <Button variant="outline" size="sm" className="h-8" onClick={() => handleToggleStatus(d.id, d.status)}>
                              {d.status === "active" ? t("تعطيل", "Disable") : t("تفعيل", "Enable")}
                            </Button>
                          ) : null}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#7C2D97]">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("رفض طلب الانضمام", "Reject Join Request")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">{t("يرجى كتابة سبب رفض السائق. سيتم إرسال هذا السبب للسائق في التطبيق.", "Please provide a reason for rejection. The driver will be notified in the app.")}</p>
            <Textarea
              placeholder={t("سبب الرفض (مثال: صورة الهوية غير واضحة)...", "Reason for rejection (e.g. ID photo unclear)...")}
              value={rejectDialog.reason}
              onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, id: "", reason: "" })}>
              {t("إلغاء", "Cancel")}
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectDialog.reason.trim() || statusMutation.isPending}>
              {t("تأكيد الرفض", "Confirm Rejection")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
