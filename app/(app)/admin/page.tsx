import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, display_name, role, is_active, created_at")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error("Unable to load user profiles.");
  }

  return (
    <>
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Administration
        </p>

        <h1 className="mt-2 font-serif text-4xl font-semibold">
          User management
        </h1>

        <p className="mt-2 text-muted-foreground">
          View registered Reflect AI accounts and their current roles.
        </p>
      </header>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-2xl text-left">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-5 py-4 text-sm font-semibold">Name</th>
              <th className="px-5 py-4 text-sm font-semibold">Role</th>
              <th className="px-5 py-4 text-sm font-semibold">Status</th>
              <th className="px-5 py-4 text-sm font-semibold">Registered</th>
            </tr>
          </thead>

          <tbody>
            {profiles?.map((profile) => (
              <tr
                key={profile.id}
                className="border-b border-border last:border-b-0"
              >
                <td className="px-5 py-4">
                  {profile.display_name || "Unnamed participant"}
                </td>

                <td className="px-5 py-4 capitalize">
                  {profile.role}
                </td>

                <td className="px-5 py-4">
                  {profile.is_active ? "Active" : "Inactive"}
                </td>

                <td className="px-5 py-4 text-sm text-muted-foreground">
                  {new Date(profile.created_at).toLocaleDateString("en-GB")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}