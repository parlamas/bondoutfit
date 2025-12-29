//src/app/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { Store, Users, Shield } from 'lucide-react';
import { useRouter } from "next/navigation";

type StoreItem = {
  id: string;
  name: string;
  country: string;
  city: string;
};

export default function HomePage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const router = useRouter();

  // ✅ Redirect store managers away from home
  useEffect(() => {
    if (role === "STORE_MANAGER") {
      router.replace("/dashboard/store");
    }
  }, [role, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {role !== "STORE_MANAGER" && <StoreSelector />}
      <IntroSection />
    </div>
  );
}
