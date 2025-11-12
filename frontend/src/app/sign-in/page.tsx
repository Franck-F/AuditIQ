import { SignInForm } from "@/components/auth/sign-in-form";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-center">
          <img
            src="/assets/logo audiot-iq big without bg.png.png"
            alt="AuditIQ"
            className="h-20 w-auto mx-auto"
          />
        </div>
        <SignInForm />
        <p className="text-center text-sm text-slate-600">
          Pas encore de compte ?{" "}
          <Link href="/sign-up" className="text-blue-600 hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}