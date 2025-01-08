import { useEffect, useState } from "react"

export interface IQueryParams {
    get: (key: string) => string | null
}

export const useQueryParams = (): IQueryParams => {

    const [queryParams, setQueryParams] = useState<URLSearchParams>();

    useEffect(() => {
        setQueryParams(new URLSearchParams(decodeURIComponent(window.location.search)));
    }, [])

    const get = (key: string) => queryParams.get(key)

    return { get }

}