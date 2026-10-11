
import {email, z} from "zod"


export const loginZodSchema = z.object({
    email:z.email("invalid email address"),
    password:z.string()
                .min(4,"password must be at least 4 characters")


})

export type ILoginPayload = z.infer<typeof loginZodSchema>