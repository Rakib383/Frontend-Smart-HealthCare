import Hero from "@/components/modules/home/Hero"
import PublicFooter from "@/components/modules/home/PublicFooter"
import PublicNavbar from "@/components/modules/home/PublicNavbar"
import Steps from "@/components/modules/home/Steps"
import TopDoctors from "@/components/modules/home/TopDoctors"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Smart HealthCare | Care that fits your life",
  description:
    "Find trusted doctors, book appointments, and manage your care with Smart HealthCare.",
}

export default function HomePage() {
  return (
    <>
      <PublicNavbar />
      <main>
        <Hero />
        <Steps />
        <TopDoctors />
      </main>
      <PublicFooter />
    </>
  )
}
