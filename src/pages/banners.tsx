import { useState } from "react";
import { useGetAdminBanners } from "@workspace/api-client-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, MousePointerClick, Eye, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminLang } from "@/contexts/AdminLanguageContext";

const authFetch = (url: string, opts: RequestInit = {}) => {
  const token = localStorage.getItem("akseer_admin_token");
  return fetch(url, { ...opts, headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json", ...opts.headers } });
};

export default function Banners() {
  const { t, lang } = useAdminLang();
  const { data: banners, isLoading } = useGetAdminBanners();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBanner, setNewBanner] = useState({ titleAr: "", titleEn: "", imageUrl: "", linkUrl: "", placement: "home_top", advertiserName: "", priceSAR: 0 });

  const PLACEMENTS: Record<string, { ar: string; en: string }> = {
    home_top: { ar: "الرئيسية (أعلى)", en: "Home (Top)" },
    clinic: { ar: "العيادات", en: "Clinics" },
    lab: { ar: "المختبرات", en: "Labs" },
    beauty: { ar: "التجميل", en: "Beauty" },
    spa: { ar: "سبا", en: "Spa" },
    store: { ar: "المتاجر", en: "Stores" },
    home_mid: { ar: "الرئيسية (وسط)", en: "Home (Middle)" }
  };

  const getPlacementLabel = (key: string) => {
    const p = PLACEMENTS[key];
    return p ? (lang === "ar" ? p.ar : p.en) : key;
  };

  const createMutation = useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      const res = await authFetch("/api/admin/banners", { method: "POST", body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    }
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await authFetch(`/api/admin/banners/${id}`, { method: "PUT", body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    }
  });
  const deleteMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const res = await authFetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    }
  });

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateMutation.mutate({ id, data: { isActive: !isActive } }, {
      onSuccess: () => {
        toast({ title: t("تم تحديث حالة البنر", "Banner status updated") });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm(t("تأكيد حذف البنر نهائياً؟", "Confirm permanent banner deletion?"))) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: t("تم حذف البنر", "Banner deleted") });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      }
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: newBanner as any }, {
      onSuccess: () => {
        toast({ title: t("تم إضافة البنر بنجاح", "Banner added successfully") });
        setIsDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
        setNewBanner({ titleAr: "", titleEn: "", imageUrl: "", linkUrl: "", placement: "home_top", advertiserName: "", priceSAR: 0 });
      },
      onError: () => toast({ title: t("فشل إضافة البنر", "Failed to add banner"), variant: "destructive" })
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0D1B2A]">{t("البنرات الإعلانية", "Ad Banners")}</h1>
          <p className="text-gray-500 mt-1">{t("إدارة المساحات الإعلانية والبنرات الترويجية في التطبيق", "Manage advertising spaces and promotional banners in the app")}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#007A65] hover:bg-[#5a1f6e] gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> {t("إضافة بنر جديد", "Add New Banner")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">{t("إضافة بنر إعلاني جديد", "Add New Ad Banner")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t("عنوان البنر (عربي)", "Banner Title (Arabic)")}</Label>
                <Input required value={newBanner.titleAr} onChange={e => setNewBanner({ ...newBanner, titleAr: e.target.value })} placeholder={t("مثال: خصم 50% على الليزر", "E.g. 50% Off Laser")} dir="rtl" />
              </div>
              <div className="space-y-2">
                <Label>{t("عنوان البنر (إنجليزي)", "Banner Title (English)")}</Label>
                <Input required value={newBanner.titleEn} onChange={e => setNewBanner({ ...newBanner, titleEn: e.target.value })} placeholder="50% Off Laser" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>{t("رابط الصورة", "Image URL")}</Label>
                <Input required value={newBanner.imageUrl} onChange={e => setNewBanner({ ...newBanner, imageUrl: e.target.value })} dir="ltr" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>{t("رابط التوجيه عند النقر (اختياري)", "Click Link (optional)")}</Label>
                <Input value={newBanner.linkUrl} onChange={e => setNewBanner({ ...newBanner, linkUrl: e.target.value })} dir="ltr" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>{t("مكان العرض", "Placement")}</Label>
                <Select value={newBanner.placement} onValueChange={v => setNewBanner({ ...newBanner, placement: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PLACEMENTS).map(([k, v]) => <SelectItem key={k} value={k}>{lang === "ar" ? v.ar : v.en}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("اسم المعلن", "Advertiser Name")}</Label>
                  <Input required value={newBanner.advertiserName} onChange={e => setNewBanner({ ...newBanner, advertiserName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t("السعر (ر.س)", "Price (SAR)")}</Label>
                  <Input required type="number" value={newBanner.priceSAR} onChange={e => setNewBanner({ ...newBanner, priceSAR: Number(e.target.value) })} />
                </div>
              </div>
              <Button type="submit" className="w-full mt-6 bg-[#007A65] hover:bg-[#5a1f6e]" disabled={createMutation.isPending}>
                {t("إضافة البنر", "Add Banner")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Card key={i} className="h-80 border-none shadow-sm"><CardContent className="p-0 h-full bg-gray-100 animate-pulse"></CardContent></Card>)}
        </div>
      ) : banners?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
          <ImageIcon className="w-16 h-16 text-gray-200 mb-4" />
          <h3 className="text-xl font-bold text-gray-700">{t("لا توجد بنرات", "No Banners")}</h3>
          <p className="text-gray-500 mt-2">{t("قم بإضافة أول بنر إعلاني للتطبيق", "Add the first ad banner to the app")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {banners?.map(banner => {
            const impressions = banner.impressions || 0;
            const clicks = banner.clicks || 0;
            const clickRate = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "0.0";
            return (
              <Card key={banner.id} className="overflow-hidden border-none shadow-sm flex flex-col group hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-100 relative border-b border-gray-100">
                  {banner.imageUrl ? (
                    <img src={banner.imageUrl} alt={banner.titleAr} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400?text=Banner")} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon className="w-12 h-12 opacity-50" /></div>
                  )}
                  <div className="absolute top-3 end-3 flex gap-2">
                    <span className={`px-2.5 py-1 text-xs rounded-md backdrop-blur-md font-medium shadow-sm ${banner.isActive ? "bg-emerald-500/90 text-white" : "bg-gray-800/80 text-white"}`}>
                      {banner.isActive ? t("نشط", "Active") : t("متوقف", "Paused")}
                    </span>
                    <span className="px-2.5 py-1 text-xs rounded-md backdrop-blur-md bg-[#0D1B2A]/80 text-white font-medium shadow-sm">
                      {getPlacementLabel(banner.placement)}
                    </span>
                  </div>
                </div>
                <CardContent className="p-5 flex-1 flex flex-col bg-white">
                  <h3 className="font-bold text-lg mb-1 truncate text-[#0D1B2A]">{lang === "ar" ? banner.titleAr : (banner.titleEn || banner.titleAr)}</h3>
                  <div className="flex justify-between items-center mb-5">
                    <p className="text-sm text-gray-500 flex items-center gap-1">{t("المعلن:", "Advertiser:")} <span className="font-medium text-gray-800">{banner.advertiserName}</span></p>
                    <Badge variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-100 border-none">{banner.priceSAR} {t("ر.س", "SAR")}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-6 mt-auto">
                    <div className="bg-gray-50 rounded-lg p-2.5 text-center border border-gray-100">
                      <div className="text-gray-500 text-[11px] mb-1 flex items-center justify-center gap-1"><Eye className="w-3 h-3" /> {t("المشاهدات", "Views")}</div>
                      <div className="font-bold text-sm">{impressions.toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 text-center border border-gray-100">
                      <div className="text-gray-500 text-[11px] mb-1 flex items-center justify-center gap-1"><MousePointerClick className="w-3 h-3" /> {t("النقرات", "Clicks")}</div>
                      <div className="font-bold text-sm">{clicks.toLocaleString()}</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2.5 text-center border border-blue-100">
                      <div className="text-blue-600 text-[11px] mb-1">{t("معدل النقر", "CTR")}</div>
                      <div className="font-bold text-sm text-blue-700">{clickRate}%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <Switch checked={banner.isActive} onCheckedChange={() => handleToggleActive(banner.id, banner.isActive)} disabled={updateMutation.isPending} dir="ltr" />
                      <span className="text-sm font-medium text-gray-700">{t("حالة العرض", "Active Status")}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(banner.id)} disabled={deleteMutation.isPending}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
