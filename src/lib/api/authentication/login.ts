import { NoticeTheme } from "@/components/noticeBox";
import { FormApiAction, FormDTOBuilder } from "../../components/dataForm";
import { SESSION_DURATION, TOKEN_STORAGE_NAME } from "../../constants";
import { ApiErrorResponse, ApiResponse, ApiAction } from "../global";

export const AuthenticationCodes: Record<string, NoticeTheme> = {
    "CONFIRMATION_SUCCESSFUL": NoticeTheme.Success,
    "CONFIRMATION_NOT_FOUND": NoticeTheme.Warning,
    "UNKNOWN": NoticeTheme.FAQ
}

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
    authenticated = true;
    dtoBuilder = new LoginDTOBuilder ();
    urlAction = "authentication/login";
    onSuccess: (status: number, body?: LoginResponse) => void = (status: number, body?: LoginResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export interface LogoutResponse extends ApiResponse {
    success: boolean
}

export class LogoutApiAction implements ApiAction<LogoutResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "authentication/logout";
    onSuccess: (status: number, body?: LogoutResponse) => void = (status: number, body?: LogoutResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}
