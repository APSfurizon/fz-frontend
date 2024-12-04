import { FormApiAction, FormDTOBuilder } from "../components/dataForm";
import { SESSION_DURATION, TOKEN_STORAGE_NAME } from "../constants";
import { ApiErrorResponse, ApiResponse, RequestAction } from "./global";

export interface LoginData {
    email?: string;
    password?: string;
}

export interface LoginResponse extends ApiResponse {
    userId: number,
    accessToken: string
}

export class LoginDTOBuilder implements FormDTOBuilder<LoginData> {
    mapToDTO = (data: FormData) => {
        let toReturn: LoginData = {
            email: data.get('email')?.toString (),
            password: data.get('password')?.toString ()
        };
        return toReturn;
    }
}

export class LoginFormAction implements FormApiAction<LoginData, LoginResponse, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST"
    authenticated = false;
    dtoBuilder = new LoginDTOBuilder ();
    urlAction = "authentication/login";
    onSuccess: (status: number, body?: LoginResponse) => void = (status: number, body?: LoginResponse) => {loginSuccess(body!)};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

function loginSuccess(body: LoginResponse) {
    localStorage.setItem(TOKEN_STORAGE_NAME, `Bearer ${body.accessToken}`);
    let sessionExpiry = new Date();
    sessionExpiry = new Date (sessionExpiry.setDate (sessionExpiry.getDate () + SESSION_DURATION));
    document.cookie = `${TOKEN_STORAGE_NAME}=Bearer ${body.accessToken}; expires=${sessionExpiry.toUTCString()}; path=/`;
}

export interface LogoutResponse extends ApiResponse {
    success: boolean
}

export class LogoutApiAction implements RequestAction<LogoutResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "authentication/logout";
    onSuccess: (status: number, body?: LogoutResponse) => void = (status: number, body?: LogoutResponse) => {logoutSuccess(body)};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {logoutSuccess()};
}

function logoutSuccess(body?: LogoutResponse) {
    localStorage.removeItem(TOKEN_STORAGE_NAME);
    document.cookie = `${TOKEN_STORAGE_NAME}=; expires=${new Date().toUTCString()}; path=/`;
}
