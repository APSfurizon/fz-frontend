import { FormApiAction, FormDTOBuilder } from "../components/dataForm";
import { ApiErrorResponse, ApiResponse } from "./global";

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
    onSuccess: (status: number, body?: LoginResponse | undefined) => void = () => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};

}