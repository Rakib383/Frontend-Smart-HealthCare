"use client"
import { getDoctors } from "@/app/(commonLayout)/consultation/_actions"
import { useQuery } from "@tanstack/react-query";

const DoctorsList = () => {

    const { data, isPending } = useQuery({
        queryKey: ["doctors"],
        queryFn: () => getDoctors(),
    })

    if (isPending) {
        return <div>Loading doctors...</div>
      }

    // console.log(data);


    return (
        <div>
           {/* {
            data.data.map((doctor:any) => (
                <div key={doctor.id}>{
                    doctor.name
                }</div>
            ))
           } */}
        </div>
    )
}

export default DoctorsList