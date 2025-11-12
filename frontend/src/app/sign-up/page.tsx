import { SignUpForm } from "@/components/auth/sign-up-form";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-center">
          <img
            src="/assets/logo-auditiq-big.png"
            alt="AuditIQ"
            className="h-20 w-auto mx-auto"
          />
        </div>
        <SignUpForm />
        <p className="text-center text-sm text-slate-600">
          Déjà un compte ?{" "}
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}