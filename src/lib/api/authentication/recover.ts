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
    targetUserId?: number,
    password?: string,
    resetPwId?: string
}

export class ChangePasswordDTOBuilder implements FormDTOBuilder<ChangePasswordApiData> {
    mapToDTO = (data: FormData) => {
        const toReturn: ChangePasswordApiData = {
            targetUserId: data.has("userId")
                ? parseInt(data.get('userId')!.toString ())
                : undefined,
            password: data.get("password")?.toString (),
            resetPwId: data.get("resetPwId")?.toString (),
        };
        return toReturn;
    }
}

export class ChangePasswordFormAction extends FormApiAction<ChangePasswordApiData, boolean, ApiErrorResponse> {
    method = RequestType.POST;
    authenticated = true;
    dtoBuilder = new ChangePasswordDTOBuilder ();
    urlAction = "authentication/pw/change";
}

export interface ChangeEmailApiData {
    targetUserId?: number,
    email: string
}

export class ChangeEmailDTOBuilder implements FormDTOBuilder<ChangeEmailApiData> {
    mapToDTO = (data: FormData) => {
        const toReturn: ChangeEmailApiData = {
            targetUserId: data.has("userId")
                ? parseInt(data.get("userId")!.toString())
                : undefined,
            email: data.get("email")!.toString()
        };
        return toReturn;
    }
}

export class ChangeEmailFormAction extends FormApiAction<ChangeEmailApiData, boolean, ApiErrorResponse> {
    method = RequestType.POST;
    authenticated = true;
    dtoBuilder = new ChangeEmailDTOBuilder();
    urlAction = "authentication/mail/change";
}
