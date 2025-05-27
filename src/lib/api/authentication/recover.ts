import { FormApiAction, FormDTOBuilder } from "../../components/dataForm";
import { ApiErrorResponse, RequestType } from "../global";

export interface RecoverApiData {
    email?: string
}

export class RecoverDTOBuilder implements FormDTOBuilder<RecoverApiData> {
    mapToDTO = (data: FormData) => {
        const toReturn: RecoverApiData = {
            email: data.get('email')?.toString (),
        };
        return toReturn;
    }
}

export class RecoverFormAction extends FormApiAction<RecoverApiData, boolean, ApiErrorResponse> {
    method = RequestType.POST;
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
        const toReturn: ChangePasswordApiData = {
            password: data.get('password')?.toString (),
            resetPwId: data.get('resetPwId')?.toString (),
        };
        return toReturn;
    }
}

export class ResetPasswordFormAction extends FormApiAction<ChangePasswordApiData, boolean, ApiErrorResponse> {
    method = RequestType.POST;
    authenticated = true;
    dtoBuilder = new ResetPasswordDTOBuilder ();
    urlAction = "authentication/pw/change";
}
