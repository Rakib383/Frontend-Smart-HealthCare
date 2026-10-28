import DateCell from "@/components/shared/cell/DateCell";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import type { DataTableFeatures } from "@/components/shared/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { IDoctor } from "@/types/doctor.types";
import { ColumnDef } from "@tanstack/react-table";
import { Star } from "lucide-react";

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const getSpecialtyTitles = (value: unknown): string[] => {
    let specialties: unknown[] = [];

    if (Array.isArray(value)) {
        specialties = value;
    } else if (isRecord(value)) {
        const collection = value.data ?? value.specialties ?? value.items;
        specialties = Array.isArray(collection) ? collection : [value];
    }

    return specialties.flatMap((item) => {
        if (typeof item === "string") {
            return item.trim() ? [item.trim()] : [];
        }

        if (!isRecord(item)) {
            return [];
        }

        const nestedSpecialty = item.specialty;
        const title = typeof nestedSpecialty === "string"
            ? nestedSpecialty
            : isRecord(nestedSpecialty)
                ? nestedSpecialty.title
                : item.title ?? item.specialtyName ?? item.name;

        return typeof title === "string" && title.trim() ? [title.trim()] : [];
    });
};

export const doctorColumns: ColumnDef<DataTableFeatures, IDoctor>[] = [
    {
        id: "name",
        accessorKey: "name",
        header: "Name",
        cell:({row}) => (
            <UserInfoCell
            name={row.original.name}
            email={row.original.email}
            profilePhoto={row.original.profilePhoto}
            />
        )

    },
    {
        id: "specialties",
        accessorFn: (doctor) => getSpecialtyTitles(doctor.specialties).join(", "),
        header: "Specialties",
        enableSorting: false,
        cell:({row}) => {
            const specialties = getSpecialtyTitles(row.original.specialties);

            if(specialties.length === 0) {
                return (
                    <span className="text-xs text-muted-foreground">No specialties assigned</span>
                )
            }

            return (
               <div className="flex max-w-[220px] flex-wrap gap-1 whitespace-normal">
                {
                    specialties.map((title, index) => {
                        return (
                            <Badge key={`${title}-${index}`} variant={"secondary"} className="h-auto min-h-5 whitespace-normal text-left">
                                {title}
                            </Badge>
                        )
                    })
                }
               </div>
            ) 
        }

    },
    {
        id: "contactNumber",
        accessorKey: "contactNumber",
        header: "Contact Number",
        enableSorting: false,
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-sm">{row.original?.contactNumber || "N/A"}</span>
            </div>
        )
    },
    {
        id: "experience",
        accessorKey: "experience",
        header: "Experience",
        cell: ({ row }) => {
            return (
                <span>
                    {
                        row.original.experience ?? 0
                    } years
                </span>
            )
        }
    },
    {
        id: "appointmentFee",
        accessorKey: "appointmentFee",
        header: "Fee",
        cell: ({ row }) => {
            return (
                <span className="text-sm font-medium">
                    ${
                        row.original.appointmentFee?.toFixed(2) ?? "N/A"
                    }
                </span>
            )
        }
    },
    {
        id: "averageRating",
        accessorKey: "averageRating",
        header: "Rating",
        cell: ({ row }) => {
            return (
                <div>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                        {
                            row.original.averageRating?.toFixed(1) || "0.0"
                        }

                    </span>
                </div>
            )
        }
    },
    {
        id: "gender",
        accessorKey: "gender",
        header: "Gender",
        cell: ({ row }) => {
            return (
                <span className="text-sm capitalize">
                    {row.original.gender.toLowerCase()}
                </span>
            )
        }
    },
    {
        id: "status",
        accessorKey: "user.status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => {
            return (
              <StatusBadgeCell status={row.original.user.status}/>
            )
        }
    },
    {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Joined On",
        cell: ({ row }) => {
            return (
               <DateCell date={row.original.createdAt} formatString="MMM dd, yyyy"/>
            )
        }
    },

]
