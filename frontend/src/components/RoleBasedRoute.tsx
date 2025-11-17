import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<"admin" | "farmer" | "plant_owner" | "seller">;
  redirectTo?: string;
}

export const RoleBasedRoute = ({ 
  children, 
  allowedRoles,
  redirectTo = "/products" 
}: RoleBasedRouteProps) => {
  const { user, isLoading } = useAuth();

  // Show nothing while loading to prevent flash of content
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Check if user has required role
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
