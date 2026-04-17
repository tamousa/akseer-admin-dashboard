import { useState } from "react";
import { Link } from "wouter";
import { useGetAdminBusinesses } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, CheckCircle2, XCircle, Store, Star } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CATEGORY_LABELS, CATEGORY_COLORS, STATUS_LABELS, PLAN_LABELS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminLang } from "@/contexts/AdminLanguageContext";

const updateBusinessApi = async ({ id, data }: { id: string; data: any }) => {
  const token = localStorage.getItem("akseer_admin_token");
  const res = await fetch(`/api/admin/businesses/${id}`, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
};

const CATEGORY_LABELS_EN: Record<string, string> = {
  clinic: "Clinic", lab: "Lab", pharmacy: "Pharmacy", spa: "Spa",
  gym: "Gym", rehab: "Rehab", store: "Store", other: "Other"
};
const STATUS_LABELS_EN: Record<string, string> = {
  active: "Active", pending: "Pending", inactive: "Inactive", suspended: "Suspended"
};
const PLAN_LABELS_EN: Record<string, string> = {
  free: "Free", basic: "Basic", premium: "Premium"
};

export default function Businesses() {
  const { t, lang, isRTL } = useAdminLang();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const { data: businesses, isLoading } = useGetAdminBusinesses({
    search: search || undefined,
    status: status !== "all" ? status as any : undefined,
    category: category !== "all" ? category : undefined
  });

  const queryClient = useQueryClient();
  const updateMutation = useMutation({ mutationFn: updateBusinessApi });
  const { toast } = useToast();

  const [rejectDialog, setRejectDialog] = useState({ open: false, id: "", reason: "" });

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    updateMutation.mutate({ id, data: { status: newStatus as any } }, {
      onSuccess: () => {
        toast({ title: t("تم التحديث بنجاح", "Updated successfully") });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
        queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      },
      onError: () => toast({ title: t("فشل التحديث", "Update failed"), variant: "destructive" })
    });
  };

  const handleApprove = (id: string) => {
    updateMutation.mutate({ id, data: { status: "active" as any } }, {
      onSuccess: () => {
        toast({ title: t("تمت الموافقة بنجاح", "Approved successfully") });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
        queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      }
    });
  };

  const handleReject = () => {
    updateMutation.mutate({
      id: rejectDialog.id,
      data: { status: "inactive" as any, rejectionReason: rejectDialog.reason }
    }, {
      onSuccess: () => {
        toast({ title: t("تم رفض الطلب", "Request rejected") });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
        queryClient.invalidateQueries({ queryKey: ["adminStats"] });
        setRejectDialog({ open: false, id: "", reason: "" });
      }
    });
  };

  const stats = {
    active: businesses?.filter(b => b.status === "active").length || 0,
    pending: businesses?.filter(b => b.status === "pending").length || 0,
    inactive: businesses?.filter(b => b.status === "inactive" || b.status === "suspended").length || 0,
    total: businesses?.length || 0
  };

  const getCategoryLabel = (cat: string) => lang === "ar" ? (CATEGORY_LABELS[cat] || cat) : (CATEGORY_LABELS_EN[cat] || cat);
  const getStatusBadge = (s: string) => {
    const labels: Record<string, { ar: string; en: string; cls: string }> = {
      active:    { ar: "نشط",     en: "Active",    cls: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" },
      pending:   { ar: "انتظار",  en: "Pending",   cls: "bg-amber-100 text-amber-800 hover:bg-amber-200" },
      inactive:  { ar: "غير نشط", en: "Inactive",  cls: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
      suspended: { ar: "موقوف",   en: "Suspended", cls: "bg-red-100 text-red-800 hover:bg-red-200" },
    };
    const entry = labels[s];
    if (!entry) return null;
    return <Badge className={`${entry.cls} border-none shadow-none`}>{lang === "ar" ? entry.ar : entry.en}</Badge>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1e0a2e]">{t("المنشآت التجارية", "Businesses")}</h1>
          <p className="text-gray-500 mt-1">{t("إدارة جميع حسابات الأعمال والمتاجر", "Manage all business accounts and stores")}</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">{t("إجمالي المنشآت", "Total Businesses")}</p>
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
              placeholder={t("ابحث باسم المنشأة أو المالك...", "Search by business name or owner...")}
              className={`${isRTL ? "pr-9" : "pl-9"} bg-white border-gray-200`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={(v: any) => setStatus(v)}>
            <SelectTrigger className="w-full md:w-[180px] bg-white border-gray-200">
              <SelectValue placeholder={t("الحالة", "Status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("الكل (الحالة)", "All (Status)")}</SelectItem>
              {Object.entries(lang === "ar" ? STATUS_LABELS : STATUS_LABELS_EN).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-[180px] bg-white border-gray-200">
              <SelectValue placeholder={t("التصنيف", "Category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("الكل (التصنيف)", "All (Category)")}</SelectItem>
              {Object.entries(lang === "ar" ? CATEGORY_LABELS : CATEGORY_LABELS_EN).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold">{t("المنشأة", "Business")}</TableHead>
                <TableHead className="font-semibold">{t("الفئة", "Category")}</TableHead>
                <TableHead className="font-semibold">{t("المدينة", "City")}</TableHead>
                <TableHead className="font-semibold">{t("الخطة", "Plan")}</TableHead>
                <TableHead className="font-semibold">{t("التقييم", "Rating")}</TableHead>
                <TableHead className="font-semibold">{t("الحجوزات", "Bookings")}</TableHead>
                <TableHead className="font-semibold">{t("الإيراد (ر.س)", "Revenue (SAR)")}</TableHead>
                <TableHead className="font-semibold">{t("الحالة", "Status")}</TableHead>
                <TableHead className="font-semibold">{t("الإجراءات", "Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : businesses?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Store className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="text-lg font-medium text-gray-500">{t("لا توجد بيانات", "No data found")}</p>
                      <p className="text-sm mt-1">{t("لم يتم العثور على منشآت مطابقة للبحث", "No businesses match your search")}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                businesses?.map((b: any) => (
                  <TableRow key={b.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center border border-gray-100 overflow-hidden shrink-0">
                          {b.logoUrl ? (
                            <img src={b.logoUrl} alt={b.nameAr} className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{b.nameAr}</div>
                          <div className="text-xs text-gray-500">{b.ownerName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${CATEGORY_COLORS[b.category] || "bg-gray-100 text-gray-700"} border-none shadow-none`}>
                        {getCategoryLabel(b.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>{b.city}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border-none shadow-none ${b.subscriptionPlan === "free" ? "bg-gray-100 text-gray-700" : b.subscriptionPlan === "basic" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                        {lang === "ar" ? (PLAN_LABELS[b.subscriptionPlan] || b.subscriptionPlan) : (PLAN_LABELS_EN[b.subscriptionPlan] || b.subscriptionPlan)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-medium text-sm">{b.rating || "0.0"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{b.totalBookings || 0}</TableCell>
                    <TableCell className="font-bold text-[#0E7490]">{(b.totalRevenue || 0).toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(b.status)}</TableCell>
                    <TableCell>
                      {b.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3" onClick={() => handleApprove(b.id)} disabled={updateMutation.isPending}>
                            <CheckCircle2 className="w-4 h-4 me-1" /> {t("موافقة", "Approve")}
                          </Button>
                          <Button size="sm" variant="destructive" className="h-8 px-3" onClick={() => setRejectDialog({ open: true, id: b.id, reason: "" })}>
                            <XCircle className="w-4 h-4 me-1" /> {t("رفض", "Reject")}
                          </Button>
                          <Link href={`/businesses/${b.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#7C2D97]">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <Switch
                            checked={b.status === "active"}
                            onCheckedChange={() => handleToggleStatus(b.id, b.status)}
                            disabled={updateMutation.isPending || (b.status !== "active" && b.status !== "inactive")}
                            dir="ltr"
                          />
                          <Link href={`/businesses/${b.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#7C2D97]">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
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
            <DialogTitle>{t("رفض طلب المنشأة", "Reject Business Application")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">{t("يرجى كتابة سبب رفض المنشأة. سيتم إرسال هذا السبب للمالك.", "Please provide a reason for rejection. The owner will be notified.")}</p>
            <Textarea
              placeholder={t("سبب الرفض (مثال: السجل التجاري غير صالح)...", "Reason for rejection (e.g. Invalid business license)...")}
              value={rejectDialog.reason}
              onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, id: "", reason: "" })}>
              {t("إلغاء", "Cancel")}
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectDialog.reason.trim() || updateMutation.isPending}>
              {t("تأكيد الرفض", "Confirm Rejection")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
