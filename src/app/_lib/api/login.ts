import { FormAction, FormDTOBuilder } from "../components/dataForm";
import { ApiErrorResponse, ApiResponse } from "./global";

export interface LoginData {
    username?: string;
    password?: string;
}

export interface LoginResponse extends ApiResponse {
    
}

export class LoginDTOBuilder implements FormDTOBuilder<LoginData> {
    mapToDTO = (data: FormData) => {
        let toReturn: LoginData = {
            username: data.get('username')?.toString (),
            password: data.get('password')?.toString ()
        };
        return toReturn;
    }

}

export class LoginFormAction implements FormAction<LoginData, LoginResponse, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST"
    authenticated = false;
    dtoBuilder = new LoginDTOBuilder ();
    urlAction = "lol";
    onSuccess: (status: number, body?: LoginResponse | undefined) => void = () => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};

}