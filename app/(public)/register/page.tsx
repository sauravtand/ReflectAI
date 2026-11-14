import { AuthForm } from "@/components/auth/auth-form";
export const instant = false;
type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const { error } = await searchParams;

  return (
    <main className="grid min-h-[75vh] place-items-center px-4 py-16">
      <AuthForm
        kind="register"
        error={error}
      />
    </main>
  );
}