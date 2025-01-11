import { FormApiAction, FormDTOBuilder } from "../../components/dataForm";
import { ApiErrorResponse } from "../global";

export interface RecoverApiData {
    email?: string
}

export class RecoverDTOBuilder implements FormDTOBuilder<RecoverApiData> {
    mapToDTO = (data: FormData) => {
        let toReturn: RecoverApiData = {
            email: data.get('email')?.toString (),
        };
        return toReturn;
    }
}

export class RecoverFormAction implements FormApiAction<RecoverApiData, Boolean, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST"
    authenticated = true;
    dtoBuilder = new RecoverDTOBuilder ();
    urlAction = "authentication/pw/reset";
    onSuccess: (status: number, body?: Boolean) => void = (status: number, body?: Boolean) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export interface ChangePasswordApiData {
    password?: string,
    resetPwId?: string
}

export class ChangePasswordDTOBuilder implements FormDTOBuilder<ChangePasswordApiData> {
    mapToDTO = (data: FormData) => {
        let toReturn: ChangePasswordApiData = {
            password: data.get('password')?.toString (),
            resetPwId: data.get('resetPwId')?.toString (),
        };
        return toReturn;
    }
}

export class ChangePasswordFormAction implements FormApiAction<ChangePasswordApiData, Boolean, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST"
    authenticated = true;
    dtoBuilder = new ChangePasswordDTOBuilder ();
    urlAction = "authentication/pw/change";
    onSuccess: (status: number, body?: Boolean) => void = (status: number, body?: Boolean) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}