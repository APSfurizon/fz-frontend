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
}

export interface ChangePasswordApiData {
    password?: string,
    resetPwId?: string
}

export class ResetPasswordDTOBuilder implements FormDTOBuilder<ChangePasswordApiData> {
    mapToDTO = (data: FormData) => {
        let toReturn: ChangePasswordApiData = {
            password: data.get('password')?.toString (),
            resetPwId: data.get('resetPwId')?.toString (),
        };
        return toReturn;
    }
}

export class ResetPasswordFormAction implements FormApiAction<ChangePasswordApiData, Boolean, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST"
    authenticated = true;
    dtoBuilder = new ResetPasswordDTOBuilder ();
    urlAction = "authentication/pw/change";
}
