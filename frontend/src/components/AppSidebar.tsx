import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Sprout,
  History,
  Droplets,
  Scan,
  User,
  Leaf,
  ShoppingBag,
  Package,
  TrendingUp,
  ShoppingCart,
  ChevronDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";

const menuSections = [
  {
    title: "Farm Management",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Plants", url: "/plants", icon: Sprout },
      { title: "Plants Watering", url: "/watering", icon: Sprout },
      { title: "Crop History", url: "/crop-history", icon: History },
    ],
  },
  {
    title: "Marketplace",
    items: [
      { title: "Products", url: "/products", icon: ShoppingBag },
      { title: "My Orders", url: "/my-orders", icon: ShoppingCart },
      {
        title: "My Products",
        url: "/my-products",
        icon: Package,
        roles: ["seller"],
      },
      {
        title: "My Sales",
        url: "/my-sales",
        icon: TrendingUp,
        roles: ["seller"],
      },
    ],
  },
  {
    title: "Tools & Analysis",
    items: [
      { title: "Irrigation", url: "/irrigation", icon: Droplets },
      { title: "Disease Detection", url: "/disease-detection", icon: Scan },
    ],
  },
  {
    title: "Account",
    items: [{ title: "Profile", url: "/profile", icon: User }],
  },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { user } = useAuth();

  const filterMenuItems = (items: any[]) => {
    return items.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(user?.role);
    });
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10">
            <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          {open && (
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg">GreenCare</span>
              <span className="text-xs text-muted-foreground">
                Farm Management
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 sm:py-4">
        {menuSections.map((section, index) => (
          <Collapsible
            key={section.title}
            defaultOpen={index === 0}
            className="mb-1 sm:mb-2"
          >
            <SidebarGroup>
              <CollapsibleTrigger className="group w-full">
                <SidebarGroupLabel className="flex items-center justify-between px-2 py-1.5 sm:py-2 text-xs font-semibold uppercase tracking-wider hover:bg-accent/50 rounded-md transition-colors">
                  {open && <span>{section.title}</span>}
                  {open && (
                    <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-200 group-data-[state=closed]:-rotate-90" />
                  )}
                </SidebarGroupLabel>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-0.5 sm:space-y-1 mt-1">
                    {filterMenuItems(section.items).map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild tooltip={item.title}>
                          <NavLink
                            to={item.url}
                            className={({ isActive }) =>
                              `flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all ${
                                isActive
                                  ? "bg-primary/10 text-primary font-medium shadow-sm"
                                  : "text-foreground hover:bg-accent/50 hover:text-foreground"
                              }`
                            }
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            {open && (
                              <span className="text-sm">{item.title}</span>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
