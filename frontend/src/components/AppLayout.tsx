import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout, user } = useAuth();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 h-16 shrink-0 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
            <div className="flex h-full items-center justify-between px-4 gap-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <div className="h-6 w-px bg-border hidden sm:block" />
                <h1 className="text-lg font-semibold hidden sm:block text-foreground">
                  GreenCare
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-sm text-muted-foreground hidden md:inline">
                  Welcome, {user?.first_name || user?.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-2 hover:bg-accent"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-background">
            <div className="p-4 sm:p-6 lg:p-8">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
