import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-xl font-medium">Sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
