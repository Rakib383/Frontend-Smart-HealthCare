"use client"

import LoadingState from "@/components/shared/LoadingState"
import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"

const PaymentSuccessRedirect = ({
  appointmentId,
  paymentId,
  checkoutSessionId,
}: {
  appointmentId: string | null
  paymentId: string | null
  checkoutSessionId: string | null
}) => {
  const router = useRouter()
  const destination = useMemo(() => {
    const query = new URLSearchParams({ payment_success: "1" })
    if (appointmentId) query.set("appointment_id", appointmentId)
    if (paymentId) query.set("payment_id", paymentId)
    if (checkoutSessionId) query.set("session_id", checkoutSessionId)
    return `/dashboard/my-appointments?${query.toString()}`
  }, [appointmentId, paymentId, checkoutSessionId])

  useEffect(() => {
    router.replace(destination)
  }, [destination, router])

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <LoadingState className="size-12" />
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Payment successful</h1>
        <p className="text-sm text-muted-foreground">Loading your booked appointment...</p>
      </div>
    </main>
  )
}

export default PaymentSuccessRedirect
