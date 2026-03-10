import { Outlet, useNavigate, useParams } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CompanySidebar } from "@/components/CompanySidebar";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { useEffect, useState } from "react";

type CompanyInfo = {
  id: string;
  name: string;
  company_logo?: string;
};

const CompanyLayout = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [company, setCompany] = useState<CompanyInfo | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await apiClient.get(`/companies/${id}`);
        const data = res?.data?.company ?? res?.data ?? {};
        setCompany({
          id: data.id ?? id,
          name: data.name ?? "Company",
          company_logo: data.company_logo,
        });
      } catch {
        setCompany({ id: id ?? "", name: "Company" });
      }
    };
    if (id) fetchCompany();
  }, [id]);

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
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <CompanySidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
              <SidebarTrigger className="mr-4" />
              <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center gap-3">
                  {company?.company_logo ? (
                    <img 
                      src={company.company_logo} 
                      alt={company.name} 
                      className="h-8 w-8 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {company?.name?.[0]?.toUpperCase() ?? "C"}
                    </div>
                  )}
                  <h1 className="text-lg font-semibold text-primary">
                    {company?.name ?? "Loading..."}
                  </h1>
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
    </SidebarProvider>
  );
};

export default CompanyLayout;
