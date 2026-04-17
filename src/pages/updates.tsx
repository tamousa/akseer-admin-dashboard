import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Smartphone, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAdminLang } from "@/contexts/AdminLanguageContext";

const fetchUpdates = async () => {
  const token = localStorage.getItem("akseer_admin_token");
  const res = await fetch("/api/admin/updates", { headers: { "Authorization": `Bearer ${token}` } });
  if (!res.ok) return [];
  return res.json();
};
const createUpdate = async (data: any) => {
  const token = localStorage.getItem("akseer_admin_token");
  const res = await fetch("/api/admin/updates", { method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error("Failed");
  return res.json();
};
const patchUpdate = async ({ id, data }: { id: string; data: any }) => {
  const token = localStorage.getItem("akseer_admin_token");
  const res = await fetch(`/api/admin/updates/${id}`, { method: "PATCH", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error("Failed");
  return res.json();
};
const deleteUpdate = async (id: string) => {
  const token = localStorage.getItem("akseer_admin_token");
  const res = await fetch(`/api/admin/updates/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
  if (!res.ok) throw new Error("Failed");
  return res.json();
};

export default function Updates() {
  const { t } = useAdminLang();
  const { data: updates, isLoading } = useQuery({ queryKey: ["updates"], queryFn: fetchUpdates });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUpdate, setNewUpdate] = useState({ version: "", title: "", platform: "both", isForced: false, isActive: true });

  const createMut = useMutation({
    mutationFn: createUpdate,
    onSuccess: () => {
      toast({ title: t("تم إضافة التحديث بنجاح", "Update added successfully") });
      queryClient.invalidateQueries({ queryKey: ["updates"] });
      setIsDialogOpen(false);
      setNewUpdate({ version: "", title: "", platform: "both", isForced: false, isActive: true });
    }
  });
  const patchMut = useMutation({
    mutationFn: patchUpdate,
    onSuccess: () => {
      toast({ title: t("تم التعديل", "Updated successfully") });
      queryClient.invalidateQueries({ queryKey: ["updates"] });
    }
  });
  const deleteMut = useMutation({
    mutationFn: deleteUpdate,
    onSuccess: () => {
      toast({ title: t("تم الحذف", "Deleted successfully") });
      queryClient.invalidateQueries({ queryKey: ["updates"] });
    }
  });

  const displayData = updates?.length ? updates : [
    { id: "1", version: "1.2.0", title: "تحسينات الأداء / Performance Improvements", platform: "both", isForced: false, isActive: true, createdAt: new Date().toISOString() },
    { id: "2", version: "1.1.0", title: "إطلاق الميزات الجديدة / New Features Launch", platform: "ios", isForced: true, isActive: false, createdAt: new Date(Date.now() - 864000000).toISOString() }
  ];

  const getPlatformLabel = (p: string) => {
    if (p === "ios") return <div className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> iOS</div>;
    if (p === "android") return <div className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> Android</div>;
    return <div className="flex items-center gap-1"><Monitor className="w-3 h-3" /> {t("الكل", "All")}</div>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1e0a2e]">{t("تحديثات التطبيق", "App Updates")}</h1>
          <p className="text-gray-500 mt-1">{t("إدارة الإصدارات والتحديثات الإجبارية للمستخدمين", "Manage versions and forced updates for users")}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7C2D97] hover:bg-[#5a1f6e] gap-2">
              <Plus className="w-4 h-4" /> {t("إضافة تحديث جديد", "Add New Update")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("إضافة تحديث جديد", "Add New Update")}</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); createMut.mutate(newUpdate); }} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t("رقم الإصدار (مثال: 1.2.0)", "Version Number (e.g. 1.2.0)")}</Label>
                <Input required value={newUpdate.version} onChange={e => setNewUpdate({ ...newUpdate, version: e.target.value })} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>{t("عنوان التحديث / الوصف المختصر", "Update Title / Short Description")}</Label>
                <Input required value={newUpdate.title} onChange={e => setNewUpdate({ ...newUpdate, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("المنصة المستهدفة", "Target Platform")}</Label>
                <Select value={newUpdate.platform} onValueChange={v => setNewUpdate({ ...newUpdate, platform: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">{t("الكل (iOS & Android)", "All (iOS & Android)")}</SelectItem>
                    <SelectItem value="ios">iOS {t("فقط", "only")}</SelectItem>
                    <SelectItem value="android">Android {t("فقط", "only")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
                <div>
                  <Label className="text-red-900 font-semibold">{t("تحديث إجباري", "Force Update")}</Label>
                  <p className="text-xs text-red-700 mt-1">{t("لن يتمكن المستخدم من دخول التطبيق دون التحديث", "Users cannot enter the app without updating")}</p>
                </div>
                <Switch checked={newUpdate.isForced} onCheckedChange={v => setNewUpdate({ ...newUpdate, isForced: v })} dir="ltr" />
              </div>
              <Button type="submit" className="w-full mt-4 bg-[#7C2D97] hover:bg-[#5a1f6e]" disabled={createMut.isPending}>
                {t("حفظ التحديث", "Save Update")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold">{t("الإصدار", "Version")}</TableHead>
              <TableHead className="font-semibold">{t("العنوان", "Title")}</TableHead>
              <TableHead className="font-semibold">{t("المنصة", "Platform")}</TableHead>
              <TableHead className="font-semibold">{t("إجباري", "Forced")}</TableHead>
              <TableHead className="font-semibold">{t("تاريخ الإطلاق", "Release Date")}</TableHead>
              <TableHead className="font-semibold">{t("الحالة", "Status")}</TableHead>
              <TableHead className="font-semibold">{t("الإجراءات", "Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">{t("جاري التحميل...", "Loading...")}</TableCell></TableRow>
            ) : displayData.map((upd: any) => (
              <TableRow key={upd.id} className="hover:bg-gray-50">
                <TableCell className="font-bold text-[#1e0a2e]" dir="ltr">{upd.version}</TableCell>
                <TableCell>{upd.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-gray-50">{getPlatformLabel(upd.platform)}</Badge>
                </TableCell>
                <TableCell>
                  {upd.isForced ? (
                    <Badge className="bg-red-100 text-red-800 border-none hover:bg-red-200">{t("نعم", "Yes")}</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-600 border-none hover:bg-gray-200">{t("لا", "No")}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-gray-500 text-sm" dir="ltr">{format(new Date(upd.createdAt), "yyyy-MM-dd")}</TableCell>
                <TableCell>
                  <Switch checked={upd.isActive} onCheckedChange={() => patchMut.mutate({ id: upd.id, data: { isActive: !upd.isActive } })} dir="ltr" />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => { if (confirm(t("هل أنت متأكد من الحذف؟", "Are you sure you want to delete?"))) deleteMut.mutate(upd.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
