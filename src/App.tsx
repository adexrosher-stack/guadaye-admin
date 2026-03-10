import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminLayout from "./components/AdminLayout";
import CompanyLayout from "./components/CompanyLayout";
import RequireAuth from "./components/RequireAuth";
import Dashboard from "./pages/Dashboard";
import Dishes from "./pages/Dishes";
import Categories from "./pages/Categories";
import Ingredients from "./pages/Ingredients";
import MediaLibrary from "./pages/MediaLibrary";
import NotFound from "./pages/NotFound";
import CreateBranchPage from "./pages/company/CreateBranchPage";
import Company from "./pages/Company";
import Packages from "./pages/Packages";
import AdminRoles from "./pages/AdminRoles";
import ActivityLogs from "./pages/ActivityLogs";
import Login from "./pages/Login";

// Company sub-pages
import CompanyOverview from "./pages/company/CompanyOverview";
import CompanyBranches from "./pages/company/CompanyBranches";
import CompanyCategories from "./pages/company/CompanyCategories";
import CompanyDishes from './pages/company/CompanyDishes';
import CompanyIngredients from "./pages/company/CompanyIngredients";
import CompanyOrders from "./pages/company/CompanyOrders";
import CompanyStaff from "./pages/company/CompanyStaff";
import CompanyTable from "./pages/company/CompanyTable";  
import CompanyShift from "./pages/company/CompanyShift";  
import CompanyMedia from "./pages/company/CompanyMedia";
import CompanySettings from "./pages/company/CompanySettings";
import CompanyProfileModal from "./pages/company/CompanyProfileModal"

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth />}>
            {/* Main Admin Layout */}
            <Route element={<SidebarProvider><AdminLayout /></SidebarProvider>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="dishes" element={<Dishes />} />
              <Route path="categories" element={<Categories />} />
              <Route path="ingredients" element={<Ingredients />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="company" element={<Company />} />
               <Route path="packages" element={<Packages />} />
              <Route path="admin-roles" element={<AdminRoles />} />
              <Route path="activity-logs" element={<ActivityLogs />} />
            </Route>
            
            {/* Company Dashboard Layout */}
        <Route path="company/:id" element={<CompanyLayout />}>
  {/* Index page */}
  <Route index element={<CompanyOverview />} />

  {/* Branch management */}
  <Route path="branches" element={<CompanyBranches />} />
  <Route path="branches/:branchId/menu-management" element={<CompanyCategories />} />
  <Route path="branches/:branchId/menu-management/:categoryId/dishes" element={<CompanyDishes />} />
  <Route path="branches/:branchId/table-management" element={<CompanyTable />} />
  <Route path="branches/:branchId/shift-management" element={<CompanyShift />} />
  <Route
  path="branches/new"
  element={<CreateBranchPage branchType="restaurant" />} 
/>

  <Route path="branches/:branchId/ingredients" element={<CompanyIngredients />} />
  <Route path="branches/:branchId/orders" element={<CompanyOrders />} />
  <Route path="branches/:branchId/staff" element={<CompanyStaff />} />
  <Route
  path="branches/:branchId/employee-management"
  element={<CompanyStaff />}
/>


  {/* Other sections */}
  <Route path="media" element={<CompanyMedia />} />
  <Route path="settings" element={<CompanySettings />} />
</Route>

          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
