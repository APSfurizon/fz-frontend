import { FormApiAction, FormDTOBuilder } from "../components/dataForm";
import { TOKEN_STORAGE_NAME } from "../constants";
import { ApiErrorResponse, ApiResponse } from "./global";

export interface RegisterPersonalInfo {
    firstName?: string;
    lastName?: string;
    fiscalCode?: string;
    birthCity?: string;
    birthRegion?: string;
    birthCountry?: string;
    birthday?: string;
    residenceAddress?: string;
    residenceZipCode?: string;
    residenceCity?: string;
    residenceRegion?: string;
    residenceCountry?: string;
    phoneNumber?: string;
}

export interface RegisterData {
    email?: string;
    password?: string;
    fursonaName?: string;
    personalUserInformation?: RegisterPersonalInfo;
}

export interface RegisterResponse extends ApiResponse {
    success: boolean
}

export class RegisterDTOBuilder implements FormDTOBuilder<RegisterData> {
    mapToDTO = (data: FormData) => {
        let personalUserInformation: RegisterPersonalInfo = {
            firstName: data.get('firstName')?.toString (),
            lastName: data.get('lastName')?.toString (),
            fiscalCode: data.get('fiscalCode')?.toString (),
            birthCity: data.get('birthCity')?.toString (),
            birthRegion: data.get('birthRegion')?.toString (),
            birthCountry: data.get('birthCountry')?.toString (),
            birthday: data.get('birthday')?.toString (),
            residenceAddress: data.get('residenceAddress')?.toString (),
            residenceZipCode: data.get('residenceZipCode')?.toString (),
            residenceCity: data.get('residenceCity')?.toString (),
            residenceRegion: data.get('residenceRegion')?.toString (),
            residenceCountry: data.get('residenceCountry')?.toString (),
            phoneNumber: data.get('phoneNumber')?.toString ()
        };
        let toReturn: RegisterData = {
            email: data.get('email')?.toString (),
            password: data.get('password')?.toString (),
            fursonaName: data.get('fursonaName')?.toString(),
            personalUserInformation: personalUserInformation
        };
        return toReturn;
    }
}

export class RegisterFormAction implements FormApiAction<RegisterData, RegisterResponse, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST"
    authenticated = false;
    dtoBuilder = new RegisterDTOBuilder ();
    urlAction = "authentication/register";
    onSuccess: (status: number, body?: RegisterResponse) => void = (status: number, body?: RegisterResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}