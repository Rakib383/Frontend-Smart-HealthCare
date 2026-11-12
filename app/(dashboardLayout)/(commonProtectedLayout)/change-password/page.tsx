import ChangePasswordForm from "@/components/modules/Auth/ChangePasswordForm"

const ChangePasswordPage = () => (
  <div className="mx-auto w-full max-w-2xl space-y-6">
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">Change password</h1>
      <p className="text-sm text-muted-foreground">
        Update your password to keep your healthcare account secure.
      </p>
    </header>
    <ChangePasswordForm />
  </div>
)

export default ChangePasswordPage
