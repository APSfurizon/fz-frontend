import { FormApiAction, FormDTOBuilder } from "../components/dataForm";
import { TOKEN_STORAGE_NAME } from "../constants";
import { ApiErrorResponse, ApiResponse } from "./global";
import { useEffect } from 'react';
import { useRouter } from 'next/router';

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

export function loginSuccess(body: LoginResponse) {
    localStorage.setItem(TOKEN_STORAGE_NAME, body.accessToken);
}