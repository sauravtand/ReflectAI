import { login, register } from "@/app/auth/actions";
import Link from "next/link";

type AuthFormProps = {
  kind: "login" | "register";
  error?: string;
  message?: string;
};

export function AuthForm({
  kind,
  error,
  message,
}: AuthFormProps){
  const reg = kind === "register";
  const formAction = reg ? register : login;
  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-sm">
      <h1 className="font-serif text-4xl font-semibold">
        {reg ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {reg
          ? "Start a calmer, more intentional reflection practice."
          : "Continue your reflection journey."}
      </p>
      {error && (
  <div
    role="alert"
    className="mt-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800"
  >
    {error}
  </div>
)}

{message && (
  <div
    role="status"
    className="mt-5 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-800"
  >
    {message}
  </div>
)}
      <form action={formAction} className="mt-7 space-y-4">
        {reg && (
          <label className="block text-sm font-medium">
            Name
            <input
              required
              name="display_name"
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3"
              placeholder="Your name"
            />
          </label>
        )}
        <label className="block text-sm font-medium">
          Email
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3"
            placeholder="you@example.com"
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            required
            name="password"
            type="password"
            minLength={8}
            autoComplete={reg ? "new-password" : "current-password"}
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3"
            placeholder="At least 8 characters"
          />
          {!reg && (
  <div className="text-right">
    <Link
      href="/forgot-password"
      className="text-sm font-semibold text-primary hover:underline"
    >
      Forgot your password?
    </Link>
  </div>
)}
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground"
        >
          {reg ? "Create account" : "Log in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {reg ? "Already registered? " : "New to ReflectAI? "}
        <Link className="font-semibold text-primary underline" href={reg ? "/login" : "/register"}>
          {reg ? "Log in" : "Create an account"}
        </Link>
      </p>
  
    </div>
  );
}
