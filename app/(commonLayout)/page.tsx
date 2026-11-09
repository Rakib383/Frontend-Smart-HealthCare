import Hero from "@/components/modules/home/Hero"
import AICareNavigation from "@/components/modules/home/AICareNavigation"
import PublicFooter from "@/components/modules/home/PublicFooter"
import PublicNavbar from "@/components/modules/home/PublicNavbar"
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
        <Steps />
        <TopDoctors />
        <AICareNavigation />
        <WhyHealora />
      </main>
      <PublicFooter />
    </>
  )
}
