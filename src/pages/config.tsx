import { useEffect, useState } from "react";
import { useGetAdminConfig, useUpdateAdminConfig } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Save, Settings2, Globe, Shield, Phone } from "lucide-react";
import { useAdminLang } from "@/contexts/AdminLanguageContext";

export default function Config() {
  const { t } = useAdminLang();
  const { data: config, isLoading } = useGetAdminConfig();
  const updateMutation = useUpdateAdminConfig();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (config) setFormData(config);
  }, [config]);

  if (isLoading) return <div className="p-12 text-center text-gray-500">{t("جاري التحميل...", "Loading...")}</div>;

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSocialChange = (network: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, socialLinks: { ...(prev.socialLinks || {}), [network]: value } }));
  };

  const handleSave = () => {
    updateMutation.mutate({ data: formData }, {
      onSuccess: () => {
        toast({ title: t("تم حفظ الإعدادات بنجاح", "Settings saved successfully") });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      },
      onError: () => toast({ title: t("فشل حفظ الإعدادات", "Failed to save settings"), variant: "destructive" })
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1e0a2e]">{t("إعدادات التطبيق", "App Settings")}</h1>
          <p className="text-gray-500 mt-1">{t("إدارة الإعدادات العامة والتكوين الأساسي لمنصة أكسير", "Manage general settings and core configuration of the Akseer platform")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm bg-gradient-to-b from-[#1e0a2e] to-[#3a1c52] text-white">
            <CardContent className="p-6">
              <Settings2 className="w-8 h-8 mb-4 text-[#A86DBF]" />
              <h3 className="text-xl font-bold mb-2">{t("تحديث التكوين", "Update Configuration")}</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                {t("تؤثر هذه الإعدادات مباشرة على تجربة المستخدمين والأعمال في التطبيق. يرجى مراجعة التغييرات قبل الحفظ.", "These settings directly affect the experience of users and businesses in the app. Please review changes before saving.")}
              </p>
              <Button onClick={handleSave} disabled={updateMutation.isPending} className="w-full bg-[#A86DBF] hover:bg-white hover:text-[#7C2D97] transition-colors gap-2 font-bold">
                <Save className="w-4 h-4" /> {t("حفظ كافة الإعدادات", "Save All Settings")}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4 space-y-4">
              {[
                { icon: <Globe className="w-4 h-4" />, label: t("هوية التطبيق", "App Identity"), bg: "bg-purple-100 text-purple-600" },
                { icon: <Phone className="w-4 h-4" />, label: t("التواصل والدعم", "Contact & Support"), bg: "bg-blue-100 text-blue-600" },
                { icon: <Shield className="w-4 h-4" />, label: t("إعدادات التشغيل", "Operations Settings"), bg: "bg-emerald-100 text-emerald-600" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium p-2 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className={`w-8 h-8 rounded-full ${item.bg} flex items-center justify-center shrink-0`}>{item.icon}</div>
                  {item.label}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-white rounded-t-xl pb-4">
              <CardTitle className="flex items-center gap-2 text-lg"><Globe className="w-5 h-5 text-[#7C2D97]" /> {t("هوية التطبيق", "App Identity")}</CardTitle>
              <CardDescription>{t("الأسماء والنصوص التوضيحية التي تظهر للمستخدمين", "Names and descriptions shown to users")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 bg-white rounded-b-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t("اسم التطبيق (عربي)", "App Name (Arabic)")}</Label>
                  <Input value={formData.appNameAr || ""} onChange={e => handleChange("appNameAr", e.target.value)} className="bg-gray-50 border-gray-200" dir="rtl" />
                </div>
                <div className="space-y-2">
                  <Label>{t("اسم التطبيق (إنجليزي)", "App Name (English)")}</Label>
                  <Input value={formData.appNameEn || ""} onChange={e => handleChange("appNameEn", e.target.value)} dir="ltr" className="bg-gray-50 border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label>{t("الشعار اللفظي (عربي)", "Tagline (Arabic)")}</Label>
                  <Input value={formData.taglineAr || ""} onChange={e => handleChange("taglineAr", e.target.value)} className="bg-gray-50 border-gray-200" dir="rtl" />
                </div>
                <div className="space-y-2">
                  <Label>{t("الشعار اللفظي (إنجليزي)", "Tagline (English)")}</Label>
                  <Input value={formData.taglineEn || ""} onChange={e => handleChange("taglineEn", e.target.value)} dir="ltr" className="bg-gray-50 border-gray-200" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{t("نص \"عن التطبيق\" (عربي)", "About Text (Arabic)")}</Label>
                  <Textarea value={formData.aboutAr || ""} onChange={e => handleChange("aboutAr", e.target.value)} className="min-h-[100px] bg-gray-50 border-gray-200" dir="rtl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-white rounded-t-xl pb-4">
              <CardTitle className="flex items-center gap-2 text-lg"><Phone className="w-5 h-5 text-blue-600" /> {t("معلومات التواصل", "Contact Information")}</CardTitle>
              <CardDescription>{t("طرق تواصل المستخدمين مع الإدارة وحسابات التواصل الاجتماعي", "Ways users can contact management and social media accounts")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 bg-white rounded-b-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t("البريد الإلكتروني للدعم", "Support Email")}</Label>
                  <Input value={formData.supportEmail || ""} onChange={e => handleChange("supportEmail", e.target.value)} dir="ltr" className="bg-gray-50 border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label>{t("رقم هاتف الدعم / الواتساب", "Support Phone / WhatsApp")}</Label>
                  <Input value={formData.supportPhone || ""} onChange={e => handleChange("supportPhone", e.target.value)} dir="ltr" className="bg-gray-50 border-gray-200" />
                </div>
                <div className="space-y-4 md:col-span-2 pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-700">{t("روابط التواصل الاجتماعي", "Social Media Links")}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: "twitter", label: t("تويتر / X", "Twitter / X"), placeholder: "https://twitter.com/..." },
                      { key: "instagram", label: t("انستغرام", "Instagram"), placeholder: "https://instagram.com/..." },
                      { key: "tiktok", label: t("تيك توك", "TikTok"), placeholder: "https://tiktok.com/..." },
                      { key: "snapchat", label: t("سناب شات", "Snapchat"), placeholder: "https://snapchat.com/..." },
                    ].map(s => (
                      <div key={s.key} className="space-y-2">
                        <Label className="text-gray-500">{s.label}</Label>
                        <Input value={formData.socialLinks?.[s.key] || ""} onChange={e => handleSocialChange(s.key, e.target.value)} dir="ltr" placeholder={s.placeholder} className="bg-gray-50 border-gray-200" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden border border-red-100">
            <CardHeader className="border-b border-red-50 bg-red-50/30 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-red-700"><Shield className="w-5 h-5" /> {t("إعدادات التشغيل الحساسة", "Critical Operations Settings")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 p-0 bg-white">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <div>
                  <Label className="text-base font-bold text-gray-900">{t("السماح بتسجيل مستخدمين جدد", "Allow New User Registrations")}</Label>
                  <p className="text-sm text-gray-500 mt-1">{t("السماح للمستخدمين والأعمال الجديدة بإنشاء حسابات في المنصة.", "Allow new users and businesses to create accounts on the platform.")}</p>
                </div>
                <Switch checked={formData.allowNewRegistrations || false} onCheckedChange={v => handleChange("allowNewRegistrations", v)} dir="ltr" />
              </div>
              <div className="flex items-center justify-between p-6 bg-red-50/10 hover:bg-red-50/30 transition-colors">
                <div>
                  <Label className="text-base font-bold text-red-700">{t("وضع الصيانة", "Maintenance Mode")}</Label>
                  <p className="text-sm text-red-600/80 mt-1">{t("إيقاف التطبيق مؤقتاً للتحديثات. لن يتمكن المستخدمون من الدخول وسيظهر لهم شاشة الصيانة.", "Temporarily shut down the app for updates. Users will see a maintenance screen.")}</p>
                </div>
                <Switch checked={formData.maintenanceMode || false} onCheckedChange={v => handleChange("maintenanceMode", v)} dir="ltr" className="data-[state=checked]:bg-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
