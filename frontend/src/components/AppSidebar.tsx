import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sprout, History, Droplets, Scan, User, Leaf, ShoppingBag, Package, TrendingUp, ChevronDown } from 'lucide-react';
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
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const menuSections = [
  {
    title: 'Farm Management',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Plants', url: '/plants', icon: Sprout },
      { title: 'Crop History', url: '/crop-history', icon: History },
    ],
  },
  {
    title: 'Marketplace',
    items: [
      { title: 'Products', url: '/products', icon: ShoppingBag },
      { title: 'My Products', url: '/my-products', icon: Package },
      { title: 'My Sales', url: '/my-sales', icon: TrendingUp },
    ],
  },
  {
    title: 'Tools & Analysis',
    items: [
      { title: 'Irrigation', url: '/irrigation', icon: Droplets },
      { title: 'Disease Detection', url: '/disease-detection', icon: Scan },
    ],
  },
  {
    title: 'Account',
    items: [
      { title: 'Profile', url: '/profile', icon: User },
    ],
  },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Leaf className="h-6 w-6 text-primary" />
          </div>
          {open && (
            <div className="flex flex-col">
              <span className="font-bold text-lg">GreenCare</span>
              <span className="text-xs text-muted-foreground">Farm Management</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        {menuSections.map((section, index) => (
          <Collapsible key={section.title} defaultOpen={index === 0} className="mb-2">
            <SidebarGroup>
              <CollapsibleTrigger className="group w-full">
                <SidebarGroupLabel className="flex items-center justify-between px-2 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-accent/50 rounded-md transition-colors">
                  {open && <span>{section.title}</span>}
                  {open && (
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=closed]:-rotate-90" />
                  )}
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1 mt-1">
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild tooltip={item.title}>
                          <NavLink
                            to={item.url}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                                isActive
                                  ? 'bg-primary/10 text-primary font-medium shadow-sm'
                                  : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                              }`
                            }
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            {open && <span className="text-sm">{item.title}</span>}
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
