
import MyAppointments from "@/components/modules/Patient/Appointments/MyAppointments"

interface MyAppointmentsPageProps {
  searchParams: Promise<{ error?: string | string[] }>
}

const MyAppointmentsPage = async ({ searchParams }: MyAppointmentsPageProps) => {
  const params = await searchParams
  const paymentCancelled = params.error === "payment_cancelled"

  return <MyAppointments paymentCancelled={paymentCancelled} />
}

export default MyAppointmentsPage