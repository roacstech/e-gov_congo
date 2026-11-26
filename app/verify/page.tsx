"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/components/LanguageProvider";
import { VerificationSection } from "@/components/verification/VerificationSection";

export default function VerifyDocumentPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const isFr = language === "fr";

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        activeTab="verify"
        onTabChange={(tab) => {
          if (tab === "verify") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            router.push(`/?tab=${tab}`);
          }
        }}
        onOpenOfficerPortal={() => router.push("/officer")}
        onPresidencyClick={() => router.push("/#presidential-vision")}
      />

      <main className="flex-1 pt-24 sm:pt-[105px]">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-14 space-y-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 text-center tracking-tight no-print">
            {isFr ? "Vérifier un document officiel" : "Verify Official Document"}
          </h1>

          <VerificationSection
            language={language}
            onSwitchToTrack={() => router.push("/?tab=track")}
          />
        </section>
      </main>

      <Footer language={language} />
    </div>
  );
}
