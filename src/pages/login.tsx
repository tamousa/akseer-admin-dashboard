import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAdminLogin } from "@workspace/api-client-react";
import { setToken } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Languages } from "lucide-react";

type Lang = "ar" | "en";

const T = {
  title: { ar: "أكسير", en: "Akseer" },
  subtitle: { ar: "المنصة الإدارية للعمليات", en: "Operations Admin Platform" },
  username: { ar: "اسم المستخدم", en: "Username" },
  password: { ar: "كلمة المرور", en: "Password" },
  submit: { ar: "تسجيل الدخول", en: "Sign In" },
  loading: { ar: "جاري الدخول...", en: "Signing in..." },
  success: { ar: "تم تسجيل الدخول بنجاح", en: "Signed in successfully" },
  errorTitle: { ar: "فشل تسجيل الدخول", en: "Sign in failed" },
  errorDesc: { ar: "تأكد من بيانات الاعتماد الخاصة بك", en: "Please check your credentials" },
  usernameRequired: { ar: "اسم المستخدم مطلوب", en: "Username is required" },
  passwordRequired: { ar: "كلمة المرور مطلوبة", en: "Password is required" },
};

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useAdminLogin();
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("akseer_admin_lang") as Lang) || "ar");

  const t = (key: keyof typeof T) => T[key][lang];
  const isRTL = lang === "ar";

  const schema = z.object({
    username: z.string().min(1, t("usernameRequired")),
    password: z.string().min(1, t("passwordRequired")),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        setToken(res.token);
        setLocation("/");
        toast({ title: t("success") });
      },
      onError: () => {
        toast({ title: t("errorTitle"), description: t("errorDesc"), variant: "destructive" });
      }
    });
  };

  const toggleLang = () => {
    const next: Lang = lang === "ar" ? "en" : "ar";
    setLang(next);
    localStorage.setItem("akseer_admin_lang", next);
  };

  return (
    <div className={`min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="w-full max-w-md bg-card p-8 rounded-2xl border shadow-sm relative">
        {/* Lang Toggle */}
        <button
          onClick={toggleLang}
          className="absolute top-4 end-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-600 transition-colors"
        >
          <Languages className="w-4 h-4" />
          {lang === "ar" ? "EN" : "ع"}
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto mb-5 flex items-center justify-center text-primary-foreground font-bold text-3xl shadow-md">أ</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("username")}</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-muted/50 border-transparent focus:bg-background h-11" dir="ltr" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("password")}</FormLabel>
                <FormControl>
                  <Input type="password" {...field} className="bg-muted/50 border-transparent focus:bg-background h-11" dir="ltr" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full h-12 text-base font-semibold mt-4 shadow-sm" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? t("loading") : t("submit")}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
