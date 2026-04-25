import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Save, CheckCircle2, Plus, Trash2, Edit2, Image as ImageIcon,
  Link2, Clock, Send, FileText, Lightbulb, BookOpen, X, ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useAdminLang } from "@/contexts/AdminLanguageContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type BlogCategory =
  | "beauty"
  | "sports"
  | "mental"
  | "mother"
  | "nutrition"
  | "men"
  | "general";

type BlogStatus = "draft" | "published" | "scheduled";

interface BlogLink {
  label: string;
  url: string;
}

interface BlogPost {
  id: string;
  category: BlogCategory;
  title: string;
  content: string;
  images: string[];
  links: BlogLink[];
  status: BlogStatus;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
}

interface Tip {
  id: string;
  type: TipType;
  textAr: string;
  textEn: string;
  createdAt: string;
}

type TipType = "daily" | "beauty" | "nutrition" | "fitness";

// ─── Constants ────────────────────────────────────────────────────────────────

const BLOG_CATEGORIES: Record<BlogCategory, { label: string; color: string }> = {
  beauty:    { label: "الجمال والعناية",       color: "bg-pink-100 text-pink-700" },
  sports:    { label: "الرياضة واللياقة",      color: "bg-blue-100 text-blue-700" },
  mental:    { label: "الصحة النفسية",          color: "bg-teal-100 text-teal-700" },
  mother:    { label: "صحة الأم والطفل",        color: "bg-yellow-100 text-yellow-700" },
  nutrition: { label: "التغذية الصحية",         color: "bg-green-100 text-green-700" },
  men:       { label: "صحة الرجل",             color: "bg-indigo-100 text-indigo-700" },
  general:   { label: "صحة عامة",              color: "bg-gray-100 text-gray-700" },
};

const TIP_TYPES: Record<TipType, { label: string; icon: string }> = {
  daily:     { label: "نصيحة اليوم (الرئيسية)", icon: "💡" },
  beauty:    { label: "نصائح الجمال والعناية",  icon: "✨" },
  nutrition: { label: "نصائح التغذية",           icon: "🥗" },
  fitness:   { label: "نصائح النشاط البدني",     icon: "🏃" },
};

const STORAGE_KEY_BLOGS = "akseer_admin_blogs";
const STORAGE_KEY_TIPS  = "akseer_admin_tips";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadBlogs(): BlogPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BLOGS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveBlogs(blogs: BlogPost[]) {
  localStorage.setItem(STORAGE_KEY_BLOGS, JSON.stringify(blogs));
}

function loadTips(): Tip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TIPS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveTips(tips: Tip[]) {
  localStorage.setItem(STORAGE_KEY_TIPS, JSON.stringify(tips));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ─── Blog Editor ──────────────────────────────────────────────────────────────

function BlogEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial?: BlogPost;
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [category, setCategory] = useState<BlogCategory>(initial?.category ?? "general");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [links, setLinks] = useState<BlogLink[]>(initial?.links ?? []);
  const [scheduledAt, setScheduledAt] = useState(initial?.scheduledAt ?? "");
  const [showSchedule, setShowSchedule] = useState(!!initial?.scheduledAt);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setImages(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const addLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    setLinks(prev => [...prev, { label: newLinkLabel.trim(), url: newLinkUrl.trim() }]);
    setNewLinkLabel("");
    setNewLinkUrl("");
  };

  const publish = (status: BlogStatus) => {
    if (!title.trim()) { toast({ title: "أدخل عنوان المدونة", variant: "destructive" }); return; }
    if (!content.trim()) { toast({ title: "أكتب محتوى المدونة", variant: "destructive" }); return; }
    if (status === "scheduled" && !scheduledAt) { toast({ title: "اختر موعد النشر", variant: "destructive" }); return; }

    const post: BlogPost = {
      id: initial?.id ?? uid(),
      category,
      title: title.trim(),
      content: content.trim(),
      images,
      links,
      status,
      scheduledAt: status === "scheduled" ? scheduledAt : undefined,
      publishedAt: status === "published" ? new Date().toISOString() : initial?.publishedAt,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };
    onSave(post);
    toast({ title: status === "published" ? "تم النشر بنجاح!" : status === "scheduled" ? "تم جدولة النشر!" : "تم حفظ المسودة" });
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-[#007A65]/10 to-teal-50 px-6 py-4 border-b flex items-center justify-between">
        <h2 className="font-bold text-[#0D1B2A] text-xl flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#007A65]" />
          {initial ? "تعديل المدونة" : "مدونة جديدة"}
        </h2>
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#0D1B2A]">تصنيف المدونة *</label>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(BLOG_CATEGORIES) as [BlogCategory, { label: string; color: string }][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                  category === key
                    ? "border-[#007A65] bg-[#E4F8F5] text-[#007A65]"
                    : "border-transparent " + val.color + " hover:border-gray-300"
                }`}
              >
                {val.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#0D1B2A]">عنوان المدونة *</label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="أدخل عنوان المدونة..."
            className="text-lg font-semibold border-gray-200 focus:border-[#007A65] h-12"
          />
        </div>

        {/* Images */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-[#0D1B2A] flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#007A65]" />
            الصور
          </label>
          <div className="flex flex-wrap gap-3">
            {images.map((src, i) => (
              <div key={i} className="relative w-28 h-28 rounded-xl overflow-hidden border group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#007A65] hover:text-[#007A65] transition-colors"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs">إضافة صورة</span>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleImage} />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#0D1B2A] flex items-center justify-between">
            <span>محتوى المدونة *</span>
            <span className="text-gray-400 font-normal">{content.length > 0 ? `${content.split(/\s+/).filter(Boolean).length} كلمة` : ""}</span>
          </label>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="اكتب محتوى مدونتك هنا... لا يوجد حد للكلمات!"
            className="min-h-[320px] text-base leading-relaxed border-gray-200 focus:border-[#007A65] resize-y"
          />
        </div>

        {/* Links */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-[#0D1B2A] flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[#007A65]" />
            روابط إضافية (اختياري)
          </label>
          {links.length > 0 && (
            <div className="space-y-2">
              {links.map((link, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2.5">
                  <Link2 className="w-4 h-4 text-[#007A65] shrink-0" />
                  <span className="text-sm font-medium text-[#0D1B2A]">{link.label}</span>
                  <span className="text-xs text-blue-600 truncate flex-1" dir="ltr">{link.url}</span>
                  <button onClick={() => setLinks(prev => prev.filter((_, j) => j !== i))}>
                    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input value={newLinkLabel} onChange={e => setNewLinkLabel(e.target.value)} placeholder="نص الرابط" className="w-40" />
            <Input value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="https://..." className="flex-1" dir="ltr" />
            <Button variant="outline" onClick={addLink} disabled={!newLinkLabel.trim() || !newLinkUrl.trim()} className="shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-3">
          <button
            onClick={() => setShowSchedule(p => !p)}
            className="flex items-center gap-2 text-sm font-semibold text-[#007A65] hover:text-[#5a1f6e]"
          >
            <Clock className="w-4 h-4" />
            جدولة للنشر لاحقاً
            <ChevronDown className={`w-4 h-4 transition-transform ${showSchedule ? "rotate-180" : ""}`} />
          </button>
          {showSchedule && (
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              className="w-72 border-[#007A65]/30 focus:border-[#007A65]"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <Button
            onClick={() => publish("published")}
            className="bg-[#007A65] hover:bg-[#5a1f6e] text-white gap-2 px-6"
          >
            <Send className="w-4 h-4" />
            نشر الآن
          </Button>
          {showSchedule && (
            <Button
              onClick={() => publish("scheduled")}
              variant="outline"
              className="border-[#007A65] text-[#007A65] gap-2 px-6"
            >
              <Clock className="w-4 h-4" />
              جدولة النشر
            </Button>
          )}
          <Button
            onClick={() => publish("draft")}
            variant="outline"
            className="gap-2 px-6"
          >
            <Save className="w-4 h-4" />
            حفظ مسودة
          </Button>
          <Button variant="ghost" onClick={onCancel} className="mr-auto text-gray-500">
            إلغاء
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Blog List ────────────────────────────────────────────────────────────────

function BlogList() {
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<BlogPost[]>(loadBlogs);
  const [editing, setEditing] = useState<BlogPost | null | "new">(null);
  const [filterCat, setFilterCat] = useState<BlogCategory | "all">("all");

  const handleSave = (post: BlogPost) => {
    setBlogs(prev => {
      const idx = prev.findIndex(b => b.id === post.id);
      const next = idx >= 0 ? prev.map(b => b.id === post.id ? post : b) : [post, ...prev];
      saveBlogs(next);
      return next;
    });
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setBlogs(prev => { const next = prev.filter(b => b.id !== id); saveBlogs(next); return next; });
    toast({ title: "تم حذف المدونة" });
  };

  const filtered = filterCat === "all" ? blogs : blogs.filter(b => b.category === filterCat);

  if (editing === "new" || editing !== null) {
    return (
      <BlogEditor
        initial={editing === "new" ? undefined : editing}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterCat("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filterCat === "all" ? "bg-[#007A65] text-white" : "bg-white border text-gray-600 hover:border-[#007A65]"}`}
          >
            الكل ({blogs.length})
          </button>
          {(Object.entries(BLOG_CATEGORIES) as [BlogCategory, { label: string; color: string }][]).map(([key, val]) => {
            const count = blogs.filter(b => b.category === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setFilterCat(key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filterCat === key ? "bg-[#007A65] text-white" : "bg-white border text-gray-600 hover:border-[#007A65]"}`}
              >
                {val.label} ({count})
              </button>
            );
          })}
        </div>
        <Button
          onClick={() => setEditing("new")}
          className="bg-[#007A65] hover:bg-[#5a1f6e] text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          مدونة جديدة
        </Button>
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border">
          <BookOpen className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">لا توجد مدونات بعد</p>
          <p className="text-gray-300 text-sm mt-1">اضغط على "مدونة جديدة" للبدء</p>
        </div>
      )}

      {/* Blog Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(post => {
          const cat = BLOG_CATEGORIES[post.category];
          const statusMap: Record<BlogStatus, { label: string; cls: string }> = {
            published: { label: "منشور",    cls: "bg-green-100 text-green-700" },
            scheduled: { label: "مجدول",    cls: "bg-blue-100 text-blue-700" },
            draft:     { label: "مسودة",    cls: "bg-gray-100 text-gray-600" },
          };
          const statusInfo = statusMap[post.status];
          return (
            <Card key={post.id} className="border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {post.images[0] && (
                <div className="h-44 overflow-hidden">
                  <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cat.color}`}>{cat.label}</span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.cls}`}>{statusInfo.label}</span>
                    {post.status === "scheduled" && post.scheduledAt && (
                      <span className="text-xs text-gray-400">{format(new Date(post.scheduledAt), "d MMM yyyy - HH:mm", { locale: ar })}</span>
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-[#0D1B2A] text-lg leading-snug">{post.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                  <span>{post.content.split(/\s+/).filter(Boolean).length} كلمة</span>
                  {post.images.length > 0 && <><span>·</span><span>{post.images.length} صور</span></>}
                  {post.links.length > 0 && <><span>·</span><span>{post.links.length} روابط</span></>}
                  <span className="mr-auto">{format(new Date(post.createdAt), "d MMM yyyy", { locale: ar })}</span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => setEditing(post)} className="gap-1.5 flex-1 text-[#007A65] border-[#007A65]/30">
                    <Edit2 className="w-3.5 h-3.5" />
                    تعديل
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(post.id)} className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tips Manager ─────────────────────────────────────────────────────────────

function TipsManager() {
  const { toast } = useToast();
  const [tips, setTips] = useState<Tip[]>(loadTips);
  const [activeType, setActiveType] = useState<TipType>("daily");
  const [newTextAr, setNewTextAr] = useState("");
  const [newTextEn, setNewTextEn] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const typeTips = tips.filter(t => t.type === activeType);

  const handleAdd = () => {
    if (!newTextAr.trim()) { toast({ title: "أكتب نص النصيحة بالعربية", variant: "destructive" }); return; }
    const tip: Tip = {
      id: uid(),
      type: activeType,
      textAr: newTextAr.trim(),
      textEn: newTextEn.trim(),
      createdAt: new Date().toISOString(),
    };
    setTips(prev => { const next = [tip, ...prev]; saveTips(next); return next; });
    setNewTextAr("");
    setNewTextEn("");
    toast({ title: "تمت إضافة النصيحة" });
  };

  const handleDelete = (id: string) => {
    setTips(prev => { const next = prev.filter(t => t.id !== id); saveTips(next); return next; });
    toast({ title: "تم حذف النصيحة" });
  };

  const startEdit = (tip: Tip) => {
    setEditingId(tip.id);
    setNewTextAr(tip.textAr);
    setNewTextEn(tip.textEn);
  };

  const handleUpdate = () => {
    if (!newTextAr.trim()) return;
    setTips(prev => {
      const next = prev.map(t => t.id === editingId ? { ...t, textAr: newTextAr.trim(), textEn: newTextEn.trim() } : t);
      saveTips(next);
      return next;
    });
    setEditingId(null);
    setNewTextAr("");
    setNewTextEn("");
    toast({ title: "تم تحديث النصيحة" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewTextAr("");
    setNewTextEn("");
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Tip type tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.entries(TIP_TYPES) as [TipType, { label: string; icon: string }][]).map(([key, val]) => {
          const count = tips.filter(t => t.type === key).length;
          return (
            <button
              key={key}
              onClick={() => { setActiveType(key); cancelEdit(); }}
              className={`p-4 rounded-2xl border-2 text-right transition-all ${
                activeType === key
                  ? "border-[#007A65] bg-[#E4F8F5]"
                  : "border-gray-100 bg-white hover:border-[#007A65]/30"
              }`}
            >
              <div className="text-2xl mb-1">{val.icon}</div>
              <div className={`text-sm font-semibold ${activeType === key ? "text-[#007A65]" : "text-[#0D1B2A]"}`}>{val.label}</div>
              <div className={`text-xs mt-0.5 ${activeType === key ? "text-[#007A65]/70" : "text-gray-400"}`}>{count} نصيحة</div>
            </button>
          );
        })}
      </div>

      {/* Add / Edit form */}
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-bold text-[#0D1B2A] flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#007A65]" />
            {editingId ? "تعديل النصيحة" : `إضافة نصيحة — ${TIP_TYPES[activeType].label}`}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded text-xs flex items-center justify-center">AR</span>
                النصيحة بالعربية *
              </label>
              <Textarea
                value={newTextAr}
                onChange={e => setNewTextAr(e.target.value)}
                placeholder="اكتب النصيحة بالعربية..."
                className="min-h-[100px] border-gray-200 focus:border-[#007A65]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded text-xs flex items-center justify-center">EN</span>
                النصيحة بالإنجليزية (اختياري)
              </label>
              <Textarea
                value={newTextEn}
                onChange={e => setNewTextEn(e.target.value)}
                placeholder="Write the tip in English..."
                className="min-h-[100px] border-gray-200 focus:border-[#007A65]"
                dir="ltr"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            {editingId ? (
              <>
                <Button onClick={handleUpdate} className="bg-[#007A65] hover:bg-[#5a1f6e] text-white gap-2">
                  <Save className="w-4 h-4" />
                  تحديث
                </Button>
                <Button variant="outline" onClick={cancelEdit}>إلغاء</Button>
              </>
            ) : (
              <Button onClick={handleAdd} className="bg-[#007A65] hover:bg-[#5a1f6e] text-white gap-2">
                <Plus className="w-4 h-4" />
                إضافة النصيحة
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips list */}
      {typeTips.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <Lightbulb className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">لا توجد نصائح بعد في هذا القسم</p>
        </div>
      ) : (
        <div className="space-y-3">
          {typeTips.map((tip, i) => (
            <Card key={tip.id} className={`border-gray-100 shadow-sm transition-all ${editingId === tip.id ? "ring-2 ring-[#007A65]" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-[#E4F8F5] text-[#007A65] rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-[#0D1B2A] font-medium leading-relaxed">{tip.textAr}</p>
                    </div>
                    {tip.textEn && (
                      <p className="text-gray-400 text-sm leading-relaxed mr-9" dir="ltr">{tip.textEn}</p>
                    )}
                    <p className="text-xs text-gray-300 mr-9">{format(new Date(tip.createdAt), "d MMM yyyy", { locale: ar })}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(tip)} className="text-[#007A65] hover:bg-[#E4F8F5]">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(tip.id)} className="text-red-400 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Static Content ────────────────────────────────────────────────────────────

const STATIC_ITEMS = [
  { key: "terms",   section: "legal",  titleAr: "الشروط والأحكام",   valueAr: "نص الشروط والأحكام هنا...",         valueEn: "Terms and conditions text here..." },
  { key: "privacy", section: "legal",  titleAr: "سياسة الخصوصية",    valueAr: "نص سياسة الخصوصية هنا...",          valueEn: "Privacy policy text here..." },
  { key: "about",   section: "about",  titleAr: "من نحن",             valueAr: "أكسير هي منصة صحية متكاملة...",    valueEn: "Akseer is a comprehensive health platform..." },
  { key: "mission", section: "about",  titleAr: "رسالتنا",            valueAr: "نسعى لتقديم تجربة صحية شاملة...",  valueEn: "We strive to provide a comprehensive health experience..." },
  { key: "faq1",    section: "faq",    titleAr: "كيف أبدأ مع أكسير؟", valueAr: "قم بتحميل التطبيق وإنشاء حساب...",  valueEn: "Download the app and create an account..." },
];

function StaticContent() {
  const { toast } = useToast();
  const [edits, setEdits] = useState<Record<string, { valueAr: string; valueEn: string }>>({});

  const sections = { legal: "قانوني", about: "عن أكسير", faq: "أسئلة شائعة" };

  const handleChange = (key: string, lang: "ar" | "en", value: string) => {
    setEdits(prev => {
      const base = STATIC_ITEMS.find(i => i.key === key)!;
      const existing = prev[key] || { valueAr: base.valueAr, valueEn: base.valueEn };
      return { ...prev, [key]: { ...existing, [lang === "ar" ? "valueAr" : "valueEn"]: value } };
    });
  };

  const handleSave = (key: string) => {
    toast({ title: "تم حفظ التغييرات" });
    setEdits(prev => { const next = { ...prev }; delete next[key]; return next; });
  };

  return (
    <Tabs defaultValue="legal" dir="rtl">
      <TabsList className="bg-white border rounded-xl p-1 shadow-sm w-full justify-start h-auto flex-wrap">
        {Object.entries(sections).map(([k, label]) => (
          <TabsTrigger key={k} value={k} className="data-[state=active]:bg-[#E4F8F5] data-[state=active]:text-[#007A65] rounded-lg px-6 py-2.5">
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {Object.keys(sections).map(sectionKey => (
        <TabsContent key={sectionKey} value={sectionKey} className="mt-6 space-y-6">
          {STATIC_ITEMS.filter(i => i.section === sectionKey).map(item => {
            const edit = edits[item.key] || { valueAr: item.valueAr, valueEn: item.valueEn };
            const changed = edits[item.key] !== undefined;
            return (
              <Card key={item.key} className="border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b flex justify-between items-center">
                  <h3 className="font-bold text-[#0D1B2A] text-lg">{item.titleAr}</h3>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded text-xs flex items-center justify-center">AR</span>
                        النص العربي
                      </label>
                      <Textarea value={edit.valueAr} onChange={e => handleChange(item.key, "ar", e.target.value)} className="min-h-[180px] bg-white" dir="rtl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded text-xs flex items-center justify-center">EN</span>
                        النص الإنجليزي
                      </label>
                      <Textarea value={edit.valueEn} onChange={e => handleChange(item.key, "en", e.target.value)} className="min-h-[180px] bg-white" dir="ltr" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2 border-t">
                    <Button
                      onClick={() => handleSave(item.key)}
                      disabled={!changed}
                      className={changed ? "bg-[#007A65] hover:bg-[#5a1f6e] text-white gap-2" : "bg-gray-100 text-gray-400 gap-2"}
                    >
                      {changed ? <Save className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      {changed ? "حفظ التغييرات" : "تم الحفظ"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      ))}
    </Tabs>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Content() {
  const { t, isRTL } = useAdminLang();
  return (
    <div className="space-y-6 animate-in fade-in duration-500" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#0D1B2A]">{t("محتوى التطبيق", "App Content")}</h1>
        <p className="text-gray-500 mt-1">{t("إدارة المدونات والنصائح والنصوص الثابتة", "Manage blogs, tips, and static content")}</p>
      </div>

      <Tabs defaultValue="blog" className="w-full" dir={isRTL ? "rtl" : "ltr"}>
        <TabsList className="bg-white border rounded-xl p-1 shadow-sm w-full justify-start h-auto flex-wrap gap-1">
          <TabsTrigger value="blog" className="data-[state=active]:bg-[#E4F8F5] data-[state=active]:text-[#007A65] rounded-lg px-6 py-2.5 gap-2">
            <BookOpen className="w-4 h-4" />
            {t("المدونة", "Blog")}
          </TabsTrigger>
          <TabsTrigger value="tips" className="data-[state=active]:bg-[#E4F8F5] data-[state=active]:text-[#007A65] rounded-lg px-6 py-2.5 gap-2">
            <Lightbulb className="w-4 h-4" />
            {t("النصائح اليومية", "Daily Tips")}
          </TabsTrigger>
          <TabsTrigger value="static" className="data-[state=active]:bg-[#E4F8F5] data-[state=active]:text-[#007A65] rounded-lg px-6 py-2.5 gap-2">
            <FileText className="w-4 h-4" />
            {t("النصوص الثابتة", "Static Content")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blog" className="mt-6">
          <BlogList />
        </TabsContent>

        <TabsContent value="tips" className="mt-6">
          <TipsManager />
        </TabsContent>

        <TabsContent value="static" className="mt-6">
          <StaticContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
