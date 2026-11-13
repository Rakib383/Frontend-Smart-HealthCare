
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

const PaymentSuccessPage = () => (
  <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
    <Card className="w-full text-center">
      <CardHeader className="items-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </span>
        <CardTitle className="text-2xl">Payment submitted</CardTitle>
        <CardDescription>
          Thank you. Your appointment payment is being confirmed. You can check its latest status in My Appointments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button render={<Link href="/dashboard/my-appointments" />}>
          View my appointments
        </Button>
      </CardContent>
    </Card>
  </div>
)

export default PaymentSuccessPage