// src/app/dashboard/page.tsx

"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardIndexPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;

    const role = (session.user as any)?.role;

    if (role === "STORE_MANAGER") {
      router.replace("/dashboard/store/profile");
    }

    if (role === "CUSTOMER") {
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  return <div className="p-6">Redirecting…</div>;
}
