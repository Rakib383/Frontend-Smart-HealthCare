import type { Metadata } from "next"
import PublicPolicyPage from "@/components/modules/home/PublicPolicyPage"

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Healora cookie policy draft.",
}

const CookiePolicyPage = () => (
  <PublicPolicyPage
    title="Cookie Policy"
    summary="This draft identifies the cookie and similar-technology details Healora should disclose after confirming how the website operates."
    sections={[
      {
        heading: "Technologies used",
        content:
          "List every cookie and similar technology used by Healora, including its provider, purpose, duration, and whether it is essential, analytics, or advertising related.",
      },
      {
        heading: "Choices and consent",
        content:
          "Explain how users can accept, reject, or change optional-cookie preferences, and how consent is collected where required. Describe browser controls and their limitations.",
      },
      {
        heading: "Third-party technologies",
        content:
          "Identify any third-party services that set or read cookies through Healora and link to their privacy information where appropriate.",
      },
      {
        heading: "Policy updates",
        content:
          "State when this policy was last updated and how material changes to cookie use or user choices will be communicated.",
      },
    ]}
  />
)

export default CookiePolicyPage
