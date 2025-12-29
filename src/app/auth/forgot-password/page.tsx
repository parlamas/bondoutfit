// src/app/auth/forgot-password/page.tsx

import { Suspense } from "react";
import ForgotPasswordClient from "./ForgotPasswordClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordClient />
    </Suspense>
  );
}
