//src/app/scout/membership/page.tsx

import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import PageLayout from "../../components/PageLayout";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getApplicationByUser,
  getMembershipCardData,
} from "@/services/application.service";
import PendingStatusPoller from "./PendingStatusPoller";

export default async function MembershipPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const application = await getApplicationByUser(user.id);
  const cardData = await getMembershipCardData(user.id);

  // An application can say APPROVED while the underlying scout record no
  // longer exists (e.g. permanently deleted via the admin roster for
  // testing). Only trust APPROVED if there's still a live, active scout
  // record backing it — otherwise this would redirect to
  // verified-member, which would bounce right back here.
  const hasActiveScout =
    cardData !== null && cardData.scout.verificationStatus === "active";

  // Approved â†’ this page's job is done, go straight to the real card.
  if (application?.status === "APPROVED" && hasActiveScout) {
    redirect("/scout/membership/verified-member");
  }

  const isOrphanedApproval =
    application?.status === "APPROVED" && !hasActiveScout;

  const hasPendingApplication = application?.status === "PENDING";
  const hasRejectedApplication = application?.status === "REJECTED";
  const hasCancelledApplication = application?.status === "CANCELLED";

  const canApply =
    !application ||
    hasRejectedApplication ||
    hasCancelledApplication ||
    isOrphanedApproval;

  return (
    <PageLayout userName={user.firstName} avatarUrl={user.avatarUrl ?? undefined}>
      <div className="space-y-4 px-5 py-6">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="relative">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-green-700">
                    Membership Preview
                  </p>
                  <h2 className="text-lg font-semibold text-slate-900">Verified Member</h2>
                </div>

                <div className="rounded-full bg-green-900 px-3 py-1 text-xs font-semibold text-white">
                  PENDING
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#f5fbe8] to-[#eef4e6] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Image
                    src="/bsp-logo-with-bkg.svg"
                    alt="BSP Logo"
                    width={32}
                    height={32}
                    className="h-8 w-8 shrink-0 object-contain"
                  />
                    <div className="text-[10px] font-semibold uppercase leading-tight text-slate-700">
                      Boy Scouts of the Philippines
                    </div>
                </div>

                {/* This card is always blurred here — this page is a status
                    gate only. The real, unblurred card lives on
                    /scout/membership/verified-member, which this page
                    redirects to once the application is APPROVED. */}
                <div className="blur-[4px]">
                  <div className="w-full aspect-[1.58/1] [perspective:1000px]">
                    <div className="relative h-full w-full rounded-2xl border border-gray-200 bg-[#F1F7EC] p-4 shadow-md overflow-hidden flex flex-col justify-between pl-9">
                      <div className="absolute top-0 left-0 bottom-0 w-6 flex flex-row">
                        <div className="h-full w-1/2 bg-red-600" />
                        <div className="h-full w-1/2 bg-blue-800" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Image
                          src="/bsp-logo-with-bkg.svg"
                          alt="BSP Logo"
                          width={32}
                          height={32}
                          className="h-8 w-8 shrink-0 object-contain"
                        />
                        <div className="text-[9px] uppercase leading-tight font-bold text-blue-900 tracking-wide">
                          <p>Boy Scouts of the Philippines</p>
                          <p className="font-normal text-gray-600">National Office</p>
                          <p className="font-light normal-case text-[7px] text-gray-400">181 Natividad Almeda-Lopez St., Ermita, Manila</p>
                        </div>
                      </div>

                      <div className="text-center">
                        <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest leading-none">
                          Membership Card
                        </h3>
                        <span className="text-[7px] font-bold text-blue-900 uppercase">
                          Valid Until: —
                        </span>
                      </div>

                      <div className="grid grid-cols-3 items-end gap-2">
                        <div className="col-span-2 space-y-2 text-[10px] pb-1">
                          <div className="flex flex-col">
                            <span className="font-bold text-blue-900 border-b border-blue-900/40 pb-0.5 leading-none">
                              —
                            </span>
                            <span className="text-[5px] text-gray-400 uppercase font-bold tracking-tight pt-0.5">Name</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="font-bold text-blue-900 border-b border-blue-900/40 pb-0.5 leading-none">
                              —
                            </span>
                            <span className="text-[5px] text-gray-400 uppercase font-bold tracking-tight pt-0.5">Designation</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="font-bold text-blue-900 border-b border-blue-900/40 pb-0.5 leading-none">
                              —
                            </span>
                            <span className="text-[5px] text-gray-400 uppercase font-bold tracking-tight pt-0.5">Council</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-end">
                          <div className="relative h-20 w-20 border border-gray-400 bg-gray-200 overflow-hidden mb-2.5 shadow-sm">
                            <div className="flex h-full w-full flex-col items-center justify-center bg-gray-300 text-gray-500 text-[8px] text-center p-1">
                              User Photo
                            </div>
                          </div>
                          <div className="w-20 border-t border-blue-900 pt-1 text-center">
                            <span className="block text-[5px] font-bold text-blue-900/70 uppercase tracking-tight leading-none">
                              Signature of Member
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-end text-[7px] text-blue-900 pb-0.5">
                        <div className="flex flex-col items-center">
                          <div className="w-20 border-t border-blue-900 pt-0.5 text-center">
                            <span className="block text-[5px] uppercase font-medium text-blue-900/80 tracking-tight">
                              Council Chairperson
                            </span>
                          </div>
                        </div>
                        <div className="text-right font-serif text-sm font-bold text-red-600 tracking-tight leading-none">
                          № <span className="tracking-normal">—</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="blur-[4px]">
                  <div className="rounded-xl bg-slate-50 p-3 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                      Membership Status
                    </p>
                    <p className="mt-2 text-4xl font-black tracking-[0.25em] text-slate-900">
                      PENDING
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
              <div className="w-full max-w-[300px] rounded-3xl border border-slate-200 bg-white/95 p-5 text-center shadow-xl">
                {canApply && (
                  <>
                    {hasRejectedApplication && (
                      <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                        <p className="font-bold text-red-700">
                          Application Rejected
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          Your payment has been refunded. You may submit
                          another membership application.
                        </p>
                      </div>
                    )}

                    {hasCancelledApplication && (
                      <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                        <p className="font-bold text-red-700">
                          Application Cancelled
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          You may submit another membership application.
                        </p>
                      </div>
                    )}

                    <Link
                      href="/scout/membership/membership-registration/agreement"
                      className="block w-full rounded-full bg-green-900 py-3 font-bold text-white transition hover:bg-green-800"
                    >
                      {hasRejectedApplication || hasCancelledApplication
                        ? "Apply Again"
                        : "Apply Membership"}
                    </Link>

                    <Link
                      href="/scout/membership/membership-registration/adult-scout/agreement"
                      className="mt-3 block w-full rounded-full border border-green-900 py-3 font-bold text-green-900 transition hover:bg-green-50"
                    >
                      Adult Scout Registration
                    </Link>

                    <p className="mt-3 text-center text-sm text-gray-700">
                      Already a member?{" "}
                      <Link
                        href="/scout/membership/membership-verification"
                        className="font-semibold text-green-700 underline hover:text-green-800"
                      >
                        Click Here
                      </Link>
                    </p>
                  </>
                )}

                {hasPendingApplication && (
                  <>
                    <PendingStatusPoller />

                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-lg font-bold text-amber-700">
                        Application Submitted
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        Your application has been forwarded to your selected
                        council and is currently awaiting review.
                      </p>
                    </div>

                    <button
                      disabled
                      className="mt-4 w-full cursor-not-allowed rounded-full bg-gray-400 py-3 font-bold text-white"
                    >
                      Awaiting Council Approval
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}