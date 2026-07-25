import { FormApiAction, FormDTOBuilder, getData } from "../../components/dataForm";
import { ApiErrorResponse } from "../networking/types";
import { RequestType } from "../networking/types";

export interface RecoverApiData {
  email?: string;
}

export class RecoverDTOBuilder implements FormDTOBuilder<RecoverApiData> {
  mapToDTO = (data: FormData) => {
    const toReturn: RecoverApiData = {
      email: getData(data, "email")?.toString(),
    };
    return toReturn;
  };
}

export class RecoverFormAction extends FormApiAction<RecoverApiData, boolean, ApiErrorResponse> {
  method = RequestType.POST;
  authenticated = true;
  dtoBuilder = new RecoverDTOBuilder();
  urlAction = "authentication/pw/reset";
}

export interface ChangePasswordApiData {
  targetUserId?: number;
  password?: string;
  resetPwId?: string;
}

export class ChangePasswordDTOBuilder implements FormDTOBuilder<ChangePasswordApiData> {
  mapToDTO = (data: FormData) => {
    const toReturn: ChangePasswordApiData = {
      targetUserId: data.has("userId") ? parseInt(getData(data, "userId")!.toString()) : undefined,
      password: getData(data, "password")?.toString(),
      resetPwId: getData(data, "resetPwId")?.toString(),
    };
    return toReturn;
  };
}

export class ChangePasswordFormAction extends FormApiAction<ChangePasswordApiData, boolean, ApiErrorResponse> {
  method = RequestType.POST;
  authenticated = true;
  dtoBuilder = new ChangePasswordDTOBuilder();
  urlAction = "authentication/pw/change";
}

export interface ChangeEmailApiData {
  targetUserId?: number;
  email: string;
}

export class ChangeEmailDTOBuilder implements FormDTOBuilder<ChangeEmailApiData> {
  mapToDTO = (data: FormData) => {
    const toReturn: ChangeEmailApiData = {
      targetUserId: data.has("userId") ? parseInt(getData(data, "userId")!.toString()) : undefined,
      email: getData(data, "email")!.toString(),
    };
    return toReturn;
  };
}

export class ChangeEmailFormAction extends FormApiAction<ChangeEmailApiData, boolean, ApiErrorResponse> {
  method = RequestType.POST;
  authenticated = true;
  dtoBuilder = new ChangeEmailDTOBuilder();
  urlAction = "authentication/mail/change";
}
