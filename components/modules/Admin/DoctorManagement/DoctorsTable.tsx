"use client"


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getDoctors } from "@/services/doctor.services"
import { useQuery } from "@tanstack/react-query"
import { tableFeatures, useTable } from '@tanstack/react-table'


const DoctorsTable = () => {

    const doctorColumns = [
        { accessorKey: "name", header: "Name" },
        // { accessorKey: "specialization", header: "Specialization" },
        { accessorKey: "experience", header: "Experience" },
        // { accessorKey: "rating", header: "Rating" },

      ]

    const {data} = useQuery({
        queryKey:["doctors"],
        queryFn:getDoctors
    })

    if(!data) {
      return <h2>no data</h2>
    }

  const features = tableFeatures({})

  const table = useTable({
    key: 'doctors-table', 
    features,
    columns:doctorColumns,
    data: data.data,
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder ? null : ( <table.FlexRender header={header} /> )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getAllCells().map((cell) => (
              <TableCell key={cell.id}>
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default DoctorsTable
