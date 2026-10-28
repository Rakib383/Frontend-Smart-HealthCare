export type ManagementSearchParams = Record<string, string | string[] | undefined>

export const serializeManagementSearchParams = (searchParams: ManagementSearchParams) => {
  const serializedSearchParams = new URLSearchParams()

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => serializedSearchParams.append(key, item))
    } else if (value !== undefined) {
      serializedSearchParams.set(key, value)
    }
  })

  return serializedSearchParams.toString()
}
