import Image from 'next/image';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import AdvancementProgress from "../components/AdvancementProgress";

const user = {
  userName: 'Juan',
  userAvatarUrl: null,
};

const advancementOptions = [
  {
    title: 'Senior Scout',
    image: '/seniorscout.svg',
  },
  {
    title: 'Senior Scout | Explorer',
    image: '/Explorer.svg',
  },
  {
    title: 'Senior Scout | Pathfinder',
    image: '/Pathfinder.svg',
  },
  {
    title: 'Senior Scout | Outdoorsman',
    image: '/Outdoorsman.svg',
  },
  {
    title: 'Senior Scout | Venturer',
    image: '/Venturer.svg',
  },
  {
    title: 'Senior Scout | Eagle Scout',
    image: '/EagleScout.svg',
  },
];

export default function AdvancementPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#f7fdf8] to-[#e7f6ea] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <Header userName={user.userName} avatarUrl={user.userAvatarUrl ?? undefined} />
        </div>

        <div className="flex-1 overflow-y-auto pb-28">
          <div className="space-y-5 px-4 py-5">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
                Advancement
              </p>
            </div>

            <AdvancementProgress />

            <div className="grid gap-3">
              {advancementOptions.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 p-2">
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={48}
                        height={48}
                        className="h-12 w-12 object-contain"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-semibold text-slate-900">{item.title}</h2>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </main>
  );
}
