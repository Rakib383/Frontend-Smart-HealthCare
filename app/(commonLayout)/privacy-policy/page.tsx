import type { Metadata } from "next"
import PublicPolicyPage from "@/components/modules/home/PublicPolicyPage"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Healora privacy policy draft.",
}

const PrivacyPolicyPage = () => (
  <PublicPolicyPage
    title="Privacy Policy"
    summary="This draft explains the topics Healora’s privacy notice should cover for people using the healthcare platform."
    sections={[
      {
        heading: "Information and use",
        content:
          "Before publication, specify the personal, account, appointment, and health information Healora collects, why each category is needed, and the lawful basis and retention period that apply.",
      },
      {
        heading: "Sharing and service providers",
        content:
          "Document which doctors, healthcare providers, technology vendors, and other recipients may access information, for what purposes, and under what safeguards. Do not rely on this draft as a complete list of recipients.",
      },
      {
        heading: "Security and retention",
        content:
          "Describe the technical and organizational safeguards used to protect information, how long each category is retained, and the process for securely deleting or anonymizing it.",
      },
      {
        heading: "Your choices and rights",
        content:
          "Add the rights available to users in each jurisdiction and clear instructions for requesting access, correction, deletion, or other applicable privacy choices.",
      },
    ]}
  />
)

export default PrivacyPolicyPage
