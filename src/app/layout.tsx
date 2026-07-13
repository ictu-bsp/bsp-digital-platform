import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/db"; // <-- Adjust this path to match your Drizzle configuration
import { users, sessions } from "@/db/schema"; // <-- Adjust to match your unified schema exports

async function getAuthenticatedScout() {
  const cookieStore = await cookies();
  
  // 1. Pull the unique session ID out of the client browser cookies
  const sessionToken = cookieStore.get("session_token")?.value;

  // 2. If the user doesn't possess a token, reject page render and force log-in
  if (!sessionToken) {
    redirect("/login");
  }

  try {
    // 3. Query Drizzle: Inner-join the sessions tracker directly to your users profile row
    const [result] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id)) // Resolves user data based on foreign key match
      .where(
        and(
          eq(sessions.id, sessionToken),               // Matches token cookie to unique session UUID row
          gt(sessions.expiresAt, new Date())           // Verifies that the session has not timed out yet
        )
      )
      .limit(1);

    // 4. If the database yields nothing (stale, fake, or mismatched session), reject access
    if (!result) {
      redirect("/login");
    }

    // 5. Success! Pass down the strongly-typed user metadata safely
    return result;
  } catch (error) {
    // Gracefully handle malformed token inputs or database communication faults
    redirect("/login");
  }
}

export default async function ScoutDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Global Authorization Guard Clause: Evaluates on the server before rendering UI elements
  const currentScout = await getAuthenticatedScout();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Persistent Left Sidebar Navigation */}
      <aside className="w-64 bg-green-900 text-white p-4 flex flex-col justify-between">
        <div>
          <div className="mb-8">
            <h2 className="text-xl font-bold tracking-tight text-white">eScout</h2>
            {/* Dynamically displays the unique logged-in user's profile metadata */}
            <p className="text-xs text-green-200 mt-1 truncate">
              {currentScout.firstName} {currentScout.lastName}
            </p>
          </div>
          
          <nav className="space-y-1 text-sm font-medium">
            {/* Context links for /scout/activities, /scout/membership, etc. */}
          </nav>
        </div>
      </aside>

      {/* Main Panel Content Pane */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-100 p-4 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">
            Boy Scouts of the Philippines
          </span>
          {/* Renders the confirmed user context in the top utility banner */}
          <span className="text-sm font-semibold text-gray-700">
            {currentScout.email}
          </span>
        </header>

        <main className="p-6 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}