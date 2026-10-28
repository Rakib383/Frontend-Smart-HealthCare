
enum Gender {
    MALE="MALE",
    FEMALE="FEMALE"
}

export enum UserStatus {
    ACTIVE = "ACTIVE",
    BLOCKED = "BLOCKED",
    DELETED = "DELETED"
}

export interface IDoctor {
    id:string;
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
    registrationNumber: string;
    experience?: number;
    gender: Gender;
    appointmentFee: number;
    qualification: string;
    currentWorkingPlace: string;
    designation: string;
    averageRating:number;
    createdAt:Date;
    user:{
        status:UserStatus
    },
    specialties?: Array<{
        specialtyId?:string;
        doctorId?:string;
        title?:string;
        specialtyName?:string;
        name?:string;
        specialty?:string | {
            id?:string;
            title?:string;
            icon?:string;
        };
    }> | string[] | null
}