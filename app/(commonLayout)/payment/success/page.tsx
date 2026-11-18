import PaymentSuccessRedirect from "@/components/modules/Patient/Appointments/PaymentSuccessRedirect"

interface PaymentSuccessPageProps {
  searchParams: Promise<{
    appointment_id?: string | string[]
    payment_id?: string | string[]
    session_id?: string | string[]
  }>
}

const PaymentSuccessPage = async ({ searchParams }: PaymentSuccessPageProps) => {
  const {
    appointment_id: appointmentId,
    payment_id: paymentId,
    session_id: checkoutSessionId,
  } = await searchParams

  return (
    <PaymentSuccessRedirect
      appointmentId={typeof appointmentId === "string" ? appointmentId : null}
      paymentId={typeof paymentId === "string" ? paymentId : null}
      checkoutSessionId={typeof checkoutSessionId === "string" ? checkoutSessionId : null}
    />
  )
}

export default PaymentSuccessPage
