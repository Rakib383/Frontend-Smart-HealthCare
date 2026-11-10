import type { Metadata } from "next"
import PublicPolicyPage from "@/components/modules/home/PublicPolicyPage"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Healora terms of service draft.",
}

const TermsOfServicePage = () => (
  <PublicPolicyPage
    title="Terms of Service"
    summary="These draft terms outline topics that should be completed before Healora’s services are used under a final user agreement."
    sections={[
      {
        heading: "Using Healora",
        content:
          "Define eligibility, account responsibilities, acceptable use, and the rules for using doctor discovery, appointment, and other platform features.",
      },
      {
        heading: "Healthcare information",
        content:
          "Clearly explain the limits of informational tools and whether Healora provides clinical care. Do not treat platform guidance as a diagnosis or a substitute for a qualified healthcare professional or emergency services.",
      },
      {
        heading: "Appointments and third-party providers",
        content:
          "Specify how booking, cancellations, fees, provider relationships, and any third-party services work, including which party is responsible for each part of the service.",
      },
      {
        heading: "Changes and contact",
        content:
          "Add the rules for updates, suspension, termination, dispute handling, governing law, and how users will be notified of changes to the final terms.",
      },
    ]}
  />
)

export default TermsOfServicePage
