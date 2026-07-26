import { useUnifiedAuth } from "@/lib/unified-auth";
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: "patient" | "doctor" | "guest";
  allowGuest?: boolean;
}

export function AuthGuard({ children, requiredRole, allowGuest = false }: AuthGuardProps) {
  const { user, isAuthenticated } = useUnifiedAuth();
  const location = useLocation();

  // If user is not authenticated, redirect to unified auth
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required and user doesn't have it
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect based on user's actual role
    switch (user?.role) {
      case "patient":
        return <Navigate to="/patient/dashboard" replace />;
      case "doctor":
        return <Navigate to="/doctor/dashboard" replace />;
      case "guest":
        return <Navigate to="/" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // If guest access is not allowed but user is a guest
  if (!allowGuest && user?.role === "guest") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function PatientGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredRole="patient">
      {children}
    </AuthGuard>
  );
}

export function DoctorGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredRole="doctor">
      {children}
    </AuthGuard>
  );
}

export function GuestAllowedGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowGuest>
      {children}
    </AuthGuard>
  );
}