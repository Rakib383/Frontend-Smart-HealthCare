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
