import { NavLink, useLocation, useParams } from "react-router-dom";
import { useEffect, useState, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderOpen,
  Leaf,
  ImageIcon,
  ChefHat,
  Building2,
  ChevronDown,
  Users,
  ShoppingBag,
  Settings,
  ArrowLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavItem = {
  title: string;
  url?: string;
  icon: React.ElementType;
  children?: NavItem[];
};

export function CompanySidebar() {
  const location = useLocation();
  const { id } = useParams();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const navigation: NavItem[] = [
    { title: "Overview", url: `/company/${id}`, icon: LayoutDashboard },
    { title: "Branches", url: `/company/${id}/branches`, icon: Building2 },
    {
      title: "Menu Management",
      icon: UtensilsCrossed,
      children: [
        { title: "Categories", url: `/company/${id}/categories`, icon: FolderOpen },
        { title: "Dishes", url: `/company/${id}/dishes`, icon: UtensilsCrossed },
        { title: "Ingredients", url: `/company/${id}/ingredients`, icon: Leaf },
      ],
    },
    { title: "Orders", url: `/company/${id}/orders`, icon: ShoppingBag },
    { title: "Staff", url: `/company/${id}/staff`, icon: Users },
    { title: "Media", url: `/company/${id}/media`, icon: ImageIcon },
    { title: "Settings", url: `/company/${id}/settings`, icon: Settings },
  ];

  useEffect(() => {
    const expandedMenus: Record<string, boolean> = {};
    navigation.forEach((item) => {
      if (item.children?.some((child) => location.pathname === child.url)) {
        expandedMenus[item.title] = true;
      }
    });
    setOpenMenus((prev) => ({ ...prev, ...expandedMenus }));
  }, [location.pathname]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <Sidebar className="border-r bg-background text-foreground">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <NavLink to="/company">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </NavLink>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <ChefHat className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-lg font-semibold text-primary">Guadaye</p>
            <p className="text-xs text-muted-foreground">Company Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase text-muted-foreground">
            Company
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isExpandable = !!item.children?.length;
                const isOpen = openMenus[item.title] ?? false;
                const isActive =
                  location.pathname === item.url ||
                  item.children?.some((child) => location.pathname === child.url);

                return (
                  <Fragment key={item.title}>
                    <SidebarMenuItem>
                      {!isExpandable ? (
                        <SidebarMenuButton asChild isActive={isActive}>
                          <NavLink
                            to={item.url!}
                            end
                            className={({ isActive }) =>
                              cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                                "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                                isActive && "bg-primary/10 text-primary font-medium"
                              )
                            }
                          >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                          </NavLink>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => toggleMenu(item.title)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                            "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                            isActive && "bg-primary/10 text-primary font-medium"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.title}
                          <ChevronDown
                            className={cn(
                              "ml-auto h-4 w-4 transition-transform duration-300",
                              isOpen ? "rotate-180" : "rotate-0"
                            )}
                          />
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>

                    <AnimatePresence initial={false}>
                      {isExpandable && isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <SidebarMenuSub>
                            {item.children!.map((child) => (
                              <SidebarMenuSubItem key={child.title}>
                                <SidebarMenuSubButton asChild isActive={location.pathname === child.url}>
                                  <NavLink
                                    to={child.url!}
                                    className={({ isActive }) =>
                                      cn(
                                        "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-all",
                                        "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                                        isActive && "bg-primary/10 text-primary font-medium"
                                      )
                                    }
                                  >
                                    <child.icon className="h-3.5 w-3.5" />
                                    <span>{child.title}</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Fragment>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
