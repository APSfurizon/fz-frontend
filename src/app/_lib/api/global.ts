export interface ApiResponse {
    status: number
}

export interface ApiErrorResponse extends Response {
    errors: ApiErrorDetail[],
    requestId: string
}

export interface ApiErrorDetail {
    message: string,
    code: string
}