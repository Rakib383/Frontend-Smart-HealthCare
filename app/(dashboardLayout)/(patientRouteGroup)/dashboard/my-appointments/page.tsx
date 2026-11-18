
import MyAppointments from "@/components/modules/Patient/Appointments/MyAppointments"

interface MyAppointmentsPageProps {
  searchParams: Promise<{
    error?: string | string[]
    payment_success?: string | string[]
    appointment_id?: string | string[]
    payment_id?: string | string[]
    session_id?: string | string[]
  }>
}

const MyAppointmentsPage = async ({ searchParams }: MyAppointmentsPageProps) => {
  const params = await searchParams
  const paymentCancelled = params.error === "payment_cancelled"
  const paymentSuccess = params.payment_success === "1"
  const paymentAppointmentId = typeof params.appointment_id === "string" ? params.appointment_id : null
  const paymentId = typeof params.payment_id === "string" ? params.payment_id : null
  const checkoutSessionId = typeof params.session_id === "string" ? params.session_id : null

  return (
    <MyAppointments
      paymentCancelled={paymentCancelled}
      paymentSuccess={paymentSuccess}
      paymentAppointmentId={paymentAppointmentId}
      paymentId={paymentId}
      checkoutSessionId={checkoutSessionId}
    />
  )
}

export default MyAppointmentsPage