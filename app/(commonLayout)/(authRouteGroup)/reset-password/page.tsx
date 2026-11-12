
import ResetPasswordForm from "@/components/modules/Auth/ResetPasswordForm"

interface ResetPasswordPageProps {
  searchParams: Promise<{ email?: string | string[] }>
}

const ResetPasswordPage = async ({ searchParams }: ResetPasswordPageProps) => {
  const params = await searchParams
  const email = Array.isArray(params.email) ? params.email[0] : params.email

  return <ResetPasswordForm initialEmail={email ?? ""} />
}

export default ResetPasswordPage
