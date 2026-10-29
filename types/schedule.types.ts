export interface ISchedule {
  id: string
  startDateTime: string | Date
  endDateTime: string | Date
  createdAt: string | Date
  updatedAt?: string | Date
}

export interface ICreateSchedulePayload {
  startDate: string
  endDate: string
  startTime: string
  endTime: string
}

export type IUpdateSchedulePayload = ICreateSchedulePayload

export interface IDoctorSchedule {
  doctorId: string
  scheduleId: string
  isBooked: boolean
  createdAt: string | Date
  schedule: ISchedule
}

export interface ICreateDoctorSchedulePayload {
  scheduleIds: string[]
}

export interface IUpdateDoctorSchedulePayload {
  scheduleIds: Array<{
    id: string
    shouldDelete: boolean
  }>
}
