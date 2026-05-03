import { NoticeTheme } from "@/components/noticeBox";
import { FormApiAction, FormDTOBuilder } from "../../components/dataForm";
import { ApiErrorResponse, ApiResponse, ApiAction, MobileApiAction, RequestType } from "../global";

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
            email: data.get('email')?.toString(),
            password: data.get('password')?.toString()
        };
        return toReturn;
    }
}

export class LoginFormAction extends FormApiAction<LoginData, LoginResponse, ApiErrorResponse> {
    method = RequestType.POST;
    authenticated = true;
    dtoBuilder = new LoginDTOBuilder();
    urlAction = "authentication/login";
}

export interface LogoutResponse extends ApiResponse {
    success: boolean
}

export class LogoutApiAction extends ApiAction<LogoutResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "authentication/logout";
}

export interface AdminSecondaryLoginData {
    username: string;
    password: string;
    platform: "web";
    versione?: string;
}

export interface AdminSecondaryLoginResponse extends ApiResponse {
    accessToken?: string;
    ruolo?: string;
    skipOTP?: boolean;
}

export class AdminSecondaryLoginApiAction extends MobileApiAction<AdminSecondaryLoginResponse, ApiErrorResponse> {
    method = RequestType.POST;
    urlAction = "mail/sendMail";
}
