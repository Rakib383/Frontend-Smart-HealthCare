
import { z } from "zod"


export const loginZodSchema = z.object({
    email:z.email("invalid email address"),
    password:z.string()
                .min(4,"password must be at least 4 characters")


})

export type ILoginPayload = z.infer<typeof loginZodSchema>

export const registerPatientZodSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
}).refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export type IRegisterPatientPayload = z.infer<typeof registerPatientZodSchema>

export const changePasswordPayloadSchema = z.object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string()
        .min(8, "New password must be at least 8 characters")
        .max(128, "New password must be no more than 128 characters"),
})

export const changePasswordFormSchema = changePasswordPayloadSchema.extend({
    confirmPassword: z.string().min(1, "Confirm your new password"),
}).refine((values) => values.newPassword !== values.currentPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
}).refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export type IChangePasswordPayload = z.infer<typeof changePasswordPayloadSchema>
export type IChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>

export const requestPasswordResetSchema = z.object({
    email: z.email("Enter a valid email address"),
})

export const resetPasswordPayloadSchema = z.object({
    email: z.email("Enter a valid email address"),
    otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
    newPassword: z.string()
        .min(8, "New password must be at least 8 characters")
        .max(128, "New password must be no more than 128 characters"),
})

export const resetPasswordFormSchema = resetPasswordPayloadSchema.extend({
    confirmPassword: z.string().min(1, "Confirm your new password"),
}).refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export type IResetPasswordPayload = z.infer<typeof resetPasswordPayloadSchema>
export type IResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>

export const verifyEmailZodSchema = z.object({
    email: z.email("Enter a valid email address"),
    otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
})

export type IVerifyEmailPayload = z.infer<typeof verifyEmailZodSchema>