import { Link, useLocation } from "wouter";
import { useLogout } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutDashboard, Users, Store, Image as ImageIcon,
  Settings, LogOut, Car, FileText, Bell, ChevronDown, DownloadCloud, Menu, Banknote, X, Languages
} from "lucide-react";
import { useGetAdminStats } from "@workspace/api-client-react";
import { Badge } from "./ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useAdminLang } from "@/contexts/AdminLanguageContext";

const fetchNotifications = async () => {
  const token = localStorage.getItem("akseer_admin_token");
  const res = await fetch("/api/admin/notifications", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
};

interface NavItem { href: string; label: string; icon: any; exact?: boolean; badge?: string; }
interface NavSection { title: string; items: NavItem[]; }

function useNavSections() {
  const { t } = useAdminLang();
  const sections: NavSection[] = [
    {
      title: "",
      items: [
        { href: "/", label: t("الرئيسية", "Dashboard"), icon: LayoutDashboard, exact: true }
      ]
    },
    {
      title: t("إدارة الحسابات", "Account Management"),
      items: [
        { href: "/businesses", label: t("المنشآت التجارية", "Businesses"), icon: Store, badge: "businesses" },
        { href: "/drivers", label: t("السائقون", "Drivers"), icon: Car, badge: "drivers" },
        { href: "/users", label: t("العملاء", "Customers"), icon: Users },
      ]
    },
    {
      title: t("المالية", "Finance"),
      items: [
        { href: "/settlements", label: t("التسويات المالية", "Settlements"), icon: Banknote },
      ]
    },
    {
      title: t("المحتوى والإعلانات", "Content & Ads"),
      items: [
        { href: "/banners", label: t("البنرات الإعلانية", "Ad Banners"), icon: ImageIcon },
        { href: "/content", label: t("محتوى التطبيق", "App Content"), icon: FileText },
        { href: "/updates", label: t("تحديثات التطبيق", "App Updates"), icon: DownloadCloud },
      ]
    },
    {
      title: t("الإعدادات", "Settings"),
      items: [
        { href: "/config", label: t("إعدادات التطبيق", "App Settings"), icon: Settings },
      ]
    }
  ];
  return sections;
}

function NavLinks({ location, pendingBusinesses, pendingDrivers, onNavigate }: {
  location: string;
  pendingBusinesses: number;
  pendingDrivers: number;
  onNavigate?: () => void;
}) {
  const navSections = useNavSections();

  const getBadge = (key?: string) => {
    if (key === "businesses" && pendingBusinesses > 0) return pendingBusinesses;
    if (key === "drivers" && pendingDrivers > 0) return pendingDrivers;
    return null;
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location === "/" || location === "";
    return location.startsWith(href) && href !== "/";
  };

  return (
    <nav className="flex-1 py-6 px-4 space-y-7 overflow-y-auto custom-scrollbar">
      {navSections.map((section, si) => (
        <div key={si} className="space-y-1">
          {section.title && (
            <h3 className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">{section.title}</h3>
          )}
          {section.items.map((item) => {
            const active = isActive(item.href, item.exact);
            const badge = getBadge(item.badge);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  active
                    ? "bg-white/10 text-white shadow-sm border border-white/10"
                    : "text-white/65 hover:bg-white/6 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4.5 h-4.5 shrink-0 ${active ? "text-[#C084FC]" : ""}`} />
                  {item.label}
                </div>
                {badge !== null && (
                  <Badge className="bg-amber-500 text-amber-950 border-none font-bold text-xs px-1.5 py-0.5 h-auto">
                    {badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, lang, toggleLang, isRTL } = useAdminLang();

  const { data: stats } = useGetAdminStats({ query: { queryKey: ["adminStats"] } });

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: !!localStorage.getItem("akseer_admin_token")
  });

  const pendingBusinesses = stats?.pendingBusinesses || 0;
  const pendingDrivers = (stats as any)?.pendingDrivers || 0;
  const unreadNotifications = notifications?.filter((n: any) => !n.isRead)?.length || 0;

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="h-[70px] px-6 border-b border-white/10 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 bg-[#A86DBF] rounded-xl flex items-center justify-center font-bold text-lg shadow-lg text-white">أ</div>
        <div>
          <h1 className="text-xl font-bold leading-none">{t("أكسير", "Akseer")}</h1>
          <p className="text-[10px] text-white/50 mt-0.5">{t("لوحة التحكم", "Admin Panel")}</p>
        </div>
      </div>
      <NavLinks
        location={location}
        pendingBusinesses={pendingBusinesses}
        pendingDrivers={pendingDrivers}
        onNavigate={onNavigate}
      />
      <div className="p-4 border-t border-white/10 space-y-2">
        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-white/60 hover:bg-white/10 hover:text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Languages className="w-4 h-4" />
          {lang === "ar" ? "English" : "العربية"}
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          {t("تسجيل الخروج", "Log Out")}
        </button>
      </div>
    </>
  );

  return (
    <div className={`min-h-[100dvh] bg-[#F3F4F6] flex ${isRTL ? "flex-row" : "flex-row-reverse"}`}>
      {/* Desktop Sidebar */}
      <aside className="w-[255px] bg-[#1e0a2e] text-white flex-col hidden md:flex shrink-0 z-20 shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sheet Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side={isRTL ? "right" : "left"}
          className="w-[260px] p-0 bg-[#1e0a2e] text-white border-none [&>button]:hidden"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div className="flex flex-col h-full">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full relative h-[100dvh]">
        {/* Top Header */}
        <header className="h-[60px] bg-white border-b flex items-center justify-between px-4 md:px-6 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-[#7C2D97] hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-[#1e0a2e] hidden md:block">{t("لوحة التحكم", "Admin Dashboard")}</h2>
            <div className="md:hidden flex items-center gap-2">
              <div className="w-7 h-7 bg-[#A86DBF] rounded-lg flex items-center justify-center text-white font-bold text-sm">أ</div>
              <span className="text-base font-bold text-[#1e0a2e]">{t("أكسير", "Akseer")}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#7C2D97] hover:bg-[#EDE9FE] rounded-lg transition-colors border border-[#7C2D97]/20"
              title={lang === "ar" ? "Switch to English" : "التبديل للعربية"}
            >
              <Languages className="w-4 h-4" />
              {lang === "ar" ? "EN" : "ع"}
            </button>

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative p-2 text-gray-500 hover:text-[#7C2D97] hover:bg-gray-100 rounded-full transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                  <h4 className="font-semibold">{t("الإشعارات", "Notifications")}</h4>
                  {unreadNotifications > 0 && (
                    <span className="text-xs text-[#7C2D97] bg-[#EDE9FE] px-2 py-1 rounded-full font-medium">
                      {unreadNotifications} {t("جديد", "new")}
                    </span>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {!notifications?.length ? (
                    <div className="p-8 text-center text-gray-400">{t("لا توجد إشعارات", "No notifications")}</div>
                  ) : (
                    notifications.map((n: any) => (
                      <div key={n.id} className={`p-4 border-b hover:bg-gray-50 flex gap-3 ${!n.isRead ? "bg-blue-50/30" : ""}`}>
                        <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0 flex items-center justify-center text-gray-500">
                          {n.entityType === "business" ? <Store className="w-4 h-4" /> : n.entityType === "driver" ? <Car className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{lang === "ar" ? (n.titleAr || n.title) : (n.titleEn || n.title)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <div className="h-7 w-px bg-gray-200 hidden md:block"></div>

            {/* User menu */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C2D97] to-[#A86DBF] flex items-center justify-center text-white text-sm font-bold">
                    {lang === "ar" ? "م" : "A"}
                  </div>
                  <div className={`${isRTL ? "text-right" : "text-left"} hidden md:block`}>
                    <p className="text-xs font-semibold text-gray-900 leading-none">{t("مدير النظام", "System Admin")}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-none">{t("الإدارة العليا", "Super Admin")}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-1" align="end">
                <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm font-medium">
                  <LogOut className="w-4 h-4" />
                  {t("تسجيل الخروج", "Log Out")}
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
