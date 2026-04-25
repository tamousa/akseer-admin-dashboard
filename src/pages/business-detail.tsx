import { useParams, useLocation } from "wouter";
import { useGetAdminBusiness } from "@workspace/api-client-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Trash2, CheckCircle, XCircle, AlertTriangle, MapPin, Phone, Mail, User, Star, Calendar, Store, Save } from "lucide-react";
import { CATEGORY_LABELS, CATEGORY_COLORS, STATUS_LABELS, PLAN_LABELS, PLAN_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useAdminLang } from "@/contexts/AdminLanguageContext";

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, isRTL } = useAdminLang();

  const { data: business, isLoading } = useGetAdminBusiness(id || "");

  const updateMutation = useMutation({
    mutationFn: async ({ id: bizId, data }: { id: string; data: any }) => {
      const token = localStorage.getItem("akseer_admin_token");
      const res = await fetch(`/api/admin/businesses/${bizId}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id: bizId }: { id: string }) => {
      const token = localStorage.getItem("akseer_admin_token");
      const res = await fetch(`/api/admin/businesses/${bizId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    }
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Editable fields state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: "", nameEn: "", city: "", subscriptionPlan: "" as any
  });

  useEffect(() => {
    if (business && !isEditing) {
      setFormData({
        nameAr: business.nameAr,
        nameEn: business.nameEn || "",
        city: business.city,
        subscriptionPlan: business.subscriptionPlan
      });
    }
  }, [business, isEditing]);

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="md:col-span-2 h-96 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
  
  if (!business) return (
    <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border">
      <Store className="w-12 h-12 text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-700">{t("لم يتم العثور على العمل", "Business not found")}</h2>
      <Button variant="outline" className="mt-4" onClick={() => setLocation("/businesses")}>{t("العودة للقائمة", "Back to list")}</Button>
    </div>
  );

  const biz = business as any;

  const handleUpdateStatus = (status: string) => {
    if (!id) return;
    updateMutation.mutate({ id, data: { status: status as any } }, {
      onSuccess: () => {
        toast({ title: t("تم تحديث الحالة بنجاح", "Status updated successfully") });
        queryClient.invalidateQueries({ queryKey: [`/api/admin/businesses/${id}`] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
        queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      },
      onError: () => toast({ title: t("حدث خطأ أثناء التحديث", "Update failed"), variant: "destructive" })
    });
  };

  const handleSaveEdits = () => {
    if (!id) return;
    updateMutation.mutate({ id, data: formData }, {
      onSuccess: () => {
        toast({ title: t("تم حفظ التعديلات بنجاح", "Changes saved successfully") });
        queryClient.invalidateQueries({ queryKey: [`/api/admin/businesses/${id}`] });
        setIsEditing(false);
      },
      onError: () => toast({ title: t("حدث خطأ أثناء الحفظ", "Save failed"), variant: "destructive" })
    });
  };

  const handleDelete = () => {
    if (!id) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: t("تم الحذف بنجاح", "Deleted successfully") });
        setDeleteDialogOpen(false);
        setLocation("/businesses");
      },
      onError: () => toast({ title: t("حدث خطأ أثناء الحذف", "Delete failed"), variant: "destructive" })
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation("/businesses")} className="shrink-0 bg-gray-50">
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#F3F4F6] flex items-center justify-center border border-gray-100 overflow-hidden shrink-0">
              {business.logoUrl ? (
                <img src={business.logoUrl} alt={business.nameAr} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#0D1B2A]">{business.nameAr}</h1>
                {business.status === 'active' && <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">{t("نشط", "Active")}</Badge>}
                {business.status === 'pending' && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none">{t("انتظار", "Pending")}</Badge>}
                {business.status === 'inactive' && <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-none">{t("غير نشط", "Inactive")}</Badge>}
                {business.status === 'suspended' && <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-none">{t("موقوف", "Suspended")}</Badge>}
              </div>
              <p className="text-sm text-gray-500">{CATEGORY_LABELS[business.category] || business.category}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {business.status !== "active" && (
            <Button onClick={() => handleUpdateStatus("active")} disabled={updateMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle className="w-4 h-4 ml-2" /> {t("تنشيط", "Activate")}
            </Button>
          )}
          {business.status !== "suspended" && business.status !== "pending" && (
            <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => handleUpdateStatus("suspended")} disabled={updateMutation.isPending}>
              <AlertTriangle className="w-4 h-4 ml-2" /> {t("إيقاف مؤقت", "Suspend")}
            </Button>
          )}
          {business.status !== "inactive" && (
            <Button variant="outline" onClick={() => handleUpdateStatus("inactive")} disabled={updateMutation.isPending}>
              <XCircle className="w-4 h-4 ml-2" /> {t("تعطيل", "Deactivate")}
            </Button>
          )}
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} disabled={deleteMutation.isPending}>
            <Trash2 className="w-4 h-4 ml-2" /> {t("حذف", "Delete")}
          </Button>
        </div>
      </div>

      {business.status === 'inactive' && biz.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-red-800">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">{t("سبب الرفض / التعطيل", "Rejection / Deactivation Reason")}</h4>
            <p className="text-sm">{biz.rejectionReason}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Grid */}
        <Card className="md:col-span-2 shadow-sm border-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t("التفاصيل الأساسية", "Basic Details")}</CardTitle>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>{t("إلغاء", "Cancel")}</Button>
                <Button size="sm" className="bg-[#007A65] hover:bg-[#5a1f6e]" onClick={handleSaveEdits} disabled={updateMutation.isPending}>
                  <Save className="w-4 h-4 ml-2" /> {t("حفظ", "Save")}
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>{t("تعديل", "Edit")}</Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("اسم المنشأة (عربي)", "Business Name (Arabic)")}</label>
                    <Input value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("اسم المنشأة (انجليزي)", "Business Name (English)")}</label>
                    <Input value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("المدينة", "City")}</label>
                    <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("خطة الاشتراك", "Subscription Plan")}</label>
                    <Select value={formData.subscriptionPlan} onValueChange={(v:any) => setFormData({...formData, subscriptionPlan: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(PLAN_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 flex items-center gap-2"><Store className="w-4 h-4" /> {t("اسم المنشأة (عربي/EN)", "Business Name (AR/EN)")}</p>
                    <p className="font-medium text-[#0D1B2A]">{business.nameAr}</p>
                    {business.nameEn && <p className="text-sm text-gray-500" dir="ltr">{business.nameEn}</p>}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> {t("المدينة", "City")}</p>
                    <p className="font-medium text-[#0D1B2A]">{business.city}</p>
                  </div>
                </>
              )}

              <div className="space-y-1 pt-4 border-t sm:border-none sm:pt-0">
                <p className="text-sm text-gray-500 flex items-center gap-2"><User className="w-4 h-4" /> {t("المالك", "Owner")}</p>
                <p className="font-medium text-[#0D1B2A]">{business.ownerName}</p>
              </div>
              <div className="space-y-1 pt-4 border-t sm:border-none sm:pt-0">
                <p className="text-sm text-gray-500 flex items-center gap-2"><Phone className="w-4 h-4" /> {t("رقم الهاتف", "Phone")}</p>
                <p className="font-medium text-[#0D1B2A]" dir="ltr">{business.phone}</p>
              </div>
              <div className="space-y-1 pt-4 border-t sm:border-none sm:pt-0">
                <p className="text-sm text-gray-500 flex items-center gap-2"><Mail className="w-4 h-4" /> {t("البريد الإلكتروني", "Email")}</p>
                <p className="font-medium text-[#0D1B2A]">{business.email}</p>
              </div>
              <div className="space-y-1 pt-4 border-t sm:border-none sm:pt-0">
                <p className="text-sm text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> {t("تاريخ التسجيل", "Registration Date")}</p>
                <p className="font-medium text-[#0D1B2A]" dir="ltr">{format(new Date(business.createdAt), 'yyyy-MM-dd HH:mm')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div className="space-y-6">
          <Card className="shadow-sm border-none">
            <CardHeader>
              <CardTitle className="text-lg">{t("الأداء والتقييم", "Performance & Rating")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-500">{t("إجمالي الحجوزات", "Total Bookings")}</span>
                <span className="font-bold text-lg">{biz.totalBookings || 0}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-500">{t("الإيرادات (ر.س)", "Revenue (SAR)")}</span>
                <span className="font-bold text-lg text-[#0E7490]">{(biz.totalRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-500">{t("التقييم العام", "Overall Rating")}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{business.rating || "0.0"}</span>
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-xs text-gray-400">({business.reviewCount || 0})</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-none bg-gradient-to-br from-teal-50 to-emerald-50">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-500 mb-2">{t("الباقة الحالية", "Current Plan")}</p>
              <Badge className={`text-base py-1 px-4 border-none shadow-sm ${PLAN_COLORS[business.subscriptionPlan] || "bg-white text-gray-800"}`}>
                {PLAN_LABELS[business.subscriptionPlan] || business.subscriptionPlan}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-red-600">{t("حذف المنشأة", "Delete Business")}</DialogTitle>
            <DialogDescription className="text-gray-600">
              {t(`هل أنت متأكد من رغبتك في حذف منشأة "${business.nameAr}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف جميع البيانات المرتبطة بها.`, `Are you sure you want to permanently delete "${business.nameAr}"? This action cannot be undone and all associated data will be deleted.`)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row-reverse sm:justify-start gap-2 mt-4">
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {t("نعم، تأكيد الحذف", "Yes, Delete")}
            </Button>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("إلغاء", "Cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
