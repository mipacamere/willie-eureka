import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function StaffLoginPage() {
  return (
    <Suspense>
      <LoginForm type="staff" title="Accesso staff" />
    </Suspense>
  );
}
