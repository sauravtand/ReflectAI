import { AuthForm } from "@/components/auth/auth-form";
export const instant = false;

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const { error, message } = await searchParams;

  return (
    <main className="grid min-h-[75vh] place-items-center px-4 py-16">
      <AuthForm
        kind="login"
        error={error}
        message={message}
      />
    </main>
  );
}