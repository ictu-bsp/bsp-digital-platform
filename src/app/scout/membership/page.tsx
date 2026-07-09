import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

const user = {
  userName: "Juan",
  userAvatarUrl: null,
};

export default function MembershipPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <div className="flex-1 w-full pb-28">
          <Header userName={user.userName} avatarUrl={user.userAvatarUrl ?? undefined} />
          <div className="space-y-4 px-4 py-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Membership</h2>
              <p className="mt-2 text-sm text-slate-600">
                Your membership details and account information will appear here.
              </p>
            </div>
          </div>
        </div>
        
        <BottomNav />
      </div>
    </main>
  );
}
