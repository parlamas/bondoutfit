//src/app/dashboard/store/profile/page.tsx

"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function StoreProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin?type=store-manager");
      return;
    }

    if (
      status === "authenticated" &&
      (session?.user as any)?.role !== "STORE_MANAGER"
    ) {
      router.replace("/");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <div className="p-6">Loading store profile…</div>;
  }

  if (!session || (session.user as any)?.role !== "STORE_MANAGER") {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">Store Profile</h1>

      <p className="mt-4 text-gray-600">
        This page is rendering correctly.
      </p>
    </div>
  );
}
