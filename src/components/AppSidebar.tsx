import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState, Fragment } from "react";
import { motion, AnimatePresence, number } from "framer-motion";
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderOpen,
  Leaf,
  ImageIcon,
  ChefHat,
  Building2,
  ChevronDown,
  UserCog,
  ShieldCheck,
  History,
  DollarSign,
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

type NavItem = {
  title: string;
  url?: string;
  icon: React.ElementType;
  children?: NavItem[];
};

const navigation: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Company Management", url: "/company", icon: Building2 },
  {
    title: "Menu Management",
    icon: UtensilsCrossed,
    children: [
      //{ title: "Categories", url: "/categories", icon: FolderOpen },
      //{ title: "Dishes", url: "/dishes", icon: UtensilsCrossed },
      //{ title: "Ingredients", url: "/ingredients", icon: Leaf },
    ],
  },
  {
    title: "User Management",
    icon: UserCog,
    children: [
      { title: "Admin Roles", url: "/admin-roles", icon: ShieldCheck },
      { title: "Activity Logs", url: "/activity-logs", icon: History },
    ],
  },
  { title: "Media Library", url: "/media", icon: ImageIcon },
  { title: "Package management ", url: "/Packages", icon: DollarSign },
];

export function AppSidebar() {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const expandedMenus: Record<string, boolean> = {};
    navigation.forEach((item) => {
      if (item.children?.some((child) => location.pathname.startsWith(child.url!))) {
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
      <SidebarHeader className="border-b p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <ChefHat className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-lg font-semibold text-primary">Guadaye</p>
            <p className="text-xs text-muted-foreground">Restaurant Admin</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase text-muted-foreground">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isExpandable = !!item.children?.length;
                const isOpen = openMenus[item.title] ?? false;
                const isActive =
                  location.pathname === item.url ||
                  item.children?.some((child) => location.pathname.startsWith(child.url!));

                return (
                  <Fragment key={item.title}>
                    <SidebarMenuItem>
                      {!isExpandable ? (
                        <SidebarMenuButton asChild isActive={isActive}>
                          <NavLink
                            to={item.url!}
                            end={item.url === "/"}
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

                    {/* Smooth Dropdown Animation */}
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
