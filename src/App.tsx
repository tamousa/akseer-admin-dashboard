import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminLanguageProvider } from "@/contexts/AdminLanguageContext";
import NotFound from "@/pages/not-found";
import { useAuthGuard } from "@/lib/auth";
import { Layout } from "@/components/layout";

// Pages
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Businesses from "@/pages/businesses";
import BusinessDetail from "@/pages/business-detail";
import Drivers from "@/pages/drivers";
import Banners from "@/pages/banners";
import Config from "@/pages/config";
import Users from "@/pages/users";
import Content from "@/pages/content";
import Updates from "@/pages/updates";
import Settlements from "@/pages/settlements";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const isReady = useAuthGuard();
  if (!isReady) return null;
  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">{() => <ProtectedRoute component={Dashboard} />}</Route>
      <Route path="/businesses">{() => <ProtectedRoute component={Businesses} />}</Route>
      <Route path="/businesses/:id">{() => <ProtectedRoute component={BusinessDetail} />}</Route>
      <Route path="/drivers">{() => <ProtectedRoute component={Drivers} />}</Route>
      <Route path="/users">{() => <ProtectedRoute component={Users} />}</Route>
      <Route path="/banners">{() => <ProtectedRoute component={Banners} />}</Route>
      <Route path="/content">{() => <ProtectedRoute component={Content} />}</Route>
      <Route path="/updates">{() => <ProtectedRoute component={Updates} />}</Route>
      <Route path="/settlements">{() => <ProtectedRoute component={Settlements} />}</Route>
      <Route path="/config">{() => <ProtectedRoute component={Config} />}</Route>
      <Route>{() => <ProtectedRoute component={NotFound} />}</Route>
    </Switch>
  );
}

function App() {
  return (
    <AdminLanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </AdminLanguageProvider>
  );
}

export default App;
