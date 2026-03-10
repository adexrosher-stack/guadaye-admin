import { Outlet, useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api";
import { clearToken } from "@/lib/auth";

const AdminLayout = () => {
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (e) {
      console.warn("Logout request failed", e);
    }
    clearToken();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center">
            <SidebarTrigger className="mr-4" />
            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-primary">Guadaye Admin</h1>
              </div>
              <div>
                <Button variant="outline" size="sm" onClick={onLogout}>Logout</Button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 bg-muted/20">
          <div className="container max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
