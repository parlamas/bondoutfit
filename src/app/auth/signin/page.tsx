// src/app/auth/signin/page.tsx

import { redirect } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  // This page redirects to home where authentication is handled
  redirect("/");
}