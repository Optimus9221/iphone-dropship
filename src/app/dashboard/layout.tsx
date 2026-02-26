"use client";

import { PhoneBackground } from "@/components/phone-background";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <PhoneBackground patternId="phones-dashboard" />
      <div className="relative">{children}</div>
    </div>
  );
}
