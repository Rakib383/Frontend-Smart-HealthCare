"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

type SearchParamValue = string | string[] | undefined

interface UseManagementTableOptions {
  queryParams: Record<string, SearchParamValue>
  pageInfo?: {
    page?: number
    pageSize?: number
  }
  defaultPageSize?: number
}

const getPositiveInteger = (value: SearchParamValue, fallback: number) => {
  const parsedValue = Number(Array.isArray(value) ? value[0] : value)
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback
}

const useManagementTable = ({
  queryParams,
  pageInfo,
  defaultPageSize = 10,
}: UseManagementTableOptions) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const requestedPage = getPositiveInteger(queryParams.page, 1)
  const requestedPageSize = getPositiveInteger(queryParams.limit, defaultPageSize)
  const page = pageInfo?.page ?? requestedPage
  const pageSize = pageInfo?.pageSize ?? requestedPageSize
  const searchTerm = searchParams.get("searchTerm") ?? ""

  const handlePageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(nextPage))
    params.set("limit", String(pageSize))
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handlePageSizeChange = (nextPageSize: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", "1")
    params.set("limit", String(nextPageSize))
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleSearch = (nextSearchTerm: string) => {
    if (nextSearchTerm === searchTerm) return

    const params = new URLSearchParams(searchParams.toString())
    if (nextSearchTerm) {
      params.set("searchTerm", nextSearchTerm)
    } else {
      params.delete("searchTerm")
    }
    params.set("page", "1")
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return {
    page,
    pageSize,
    searchTerm,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
  }
}

export default useManagementTable
