import Hero from "@/components/modules/home/Hero"
import AICareNavigation from "@/components/modules/home/AICareNavigation"
import CareConnectionBanner from "@/components/modules/home/CareConnectionBanner"
import PublicFooter from "@/components/modules/home/PublicFooter"
import PublicNavbar from "@/components/modules/home/PublicNavbar"
import PlatformStats from "@/components/modules/home/PlatformStats"
import Steps from "@/components/modules/home/Steps"
import TopDoctors from "@/components/modules/home/TopDoctors"
import WhyHealora from "@/components/modules/home/WhyHealora"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Where Healthcare Meets Intelligence",
  description:
    "Where Healthcare Meets Intelligence",
}

export default function HomePage() {
  return (
    <>
      <PublicNavbar />
      <main>
        <Hero />
        <PlatformStats />
        <TopDoctors />
        <WhyHealora />
        <Steps />
        <AICareNavigation />
        <CareConnectionBanner />
      </main>
      <PublicFooter />
    </>
  )
}
