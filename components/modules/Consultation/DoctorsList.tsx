"use client"
import { getDoctors } from "@/services/doctor.services"
import { useQuery } from "@tanstack/react-query"

const doctorsQueryString = "page=1&limit=10"

const DoctorsList = () => {
    const { isPending, isError } = useQuery({
        queryKey: ["doctors", doctorsQueryString],
        queryFn: () => getDoctors(doctorsQueryString),
    })

    if (isPending) {
        return <div>Loading doctors...</div>
    }

    if (isError) {
        return <div role="alert">Unable to load doctors.</div>
    }

    return <div />
}

export default DoctorsList