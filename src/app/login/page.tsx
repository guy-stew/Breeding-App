import LoginForm from "./LoginForm";
import { FullLogo, FullLogoDark } from "../BrandLogo";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* WhelpWise logo — light/dark swap */}
        <div className="mb-8 flex justify-center">
          <FullLogo className="block h-auto w-60 dark:hidden" />
          <FullLogoDark className="hidden h-auto w-60 dark:block" />
        </div>
        <h1 className="mb-6 text-center text-lg font-medium text-neutral-600 dark:text-neutral-300">
          Sign in
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}
