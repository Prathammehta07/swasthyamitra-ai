import { useEffect, useState } from "react";
import { useUnifiedAuth } from "@/lib/unified-auth";
import { ensureDemoAccounts } from "@/lib/unified-auth";

// Demo data seeder component - ensures demo accounts are ready
export function DemoSeeder() {
  const { user } = useUnifiedAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Seed demo data on mount and wait for completion
    ensureDemoAccounts().then(() => {
      setReady(true);
      console.log("Demo accounts are ready!");
    }).catch(err => {
      console.error("Failed to seed demo data:", err);
      setReady(true); // Still allow login even if seeding fails
    });
  }, []);

  // This component doesn't render anything
  return null;
}