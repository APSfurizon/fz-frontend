import { NoticeTheme } from "@/components/noticeBox";
import { FormDTOBuilder, getData } from "../../components/dataForm";
import { ApiAction, ApiErrorResponse, ApiResponse, Endpoint, MobileApiAction, RequestType } from "../networking/types";

export const AuthenticationCodes: Record<string, NoticeTheme> = {
  CONFIRMATION_SUCCESSFUL: NoticeTheme.Success,
  CONFIRMATION_NOT_FOUND: NoticeTheme.Warning,
  UNKNOWN: NoticeTheme.FAQ,
};

export interface LoginData {
  email?: string;
  password?: string;
}

export interface LoginResponse extends ApiResponse {
  userId: number;
  accessToken: string;
}

export class LoginDTOBuilder implements FormDTOBuilder<LoginData> {
  mapToDTO = (data: FormData) => {
    return {
      email: getData(data, "email")?.toString(),
      password: getData(data, "password")?.toString(),
    };
  };
}

export class LoginFormAction extends ApiAction<LoginResponse, ApiErrorResponse> {
  endpoint = Endpoint.BACKEND;
  method = RequestType.POST;
  authenticated = true;
  urlAction = "authentication/login";
}

export interface LogoutResponse extends ApiResponse {
  success: boolean;
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
