import { UserRole } from "@/lib/authUtils";


export interface UserInfo {
    id:string,
    email:string,
    role:UserRole,
    name:string,
}


