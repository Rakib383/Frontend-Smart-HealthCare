
import VerifyEmailForm from "@/components/modules/Auth/VerifyEmailForm"

interface VerifyEmailPageProps {
  searchParams: Promise<{ email?: string }>
}

const VerifyEmailPage = async ({ searchParams }: VerifyEmailPageProps) => {
  const { email = "" } = await searchParams
  return <VerifyEmailForm email={email} />
}

export default VerifyEmailPage
