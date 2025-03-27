import { CountrySearchResult } from "@/lib/api/geo";
import { FormApiAction, FormDTOBuilder } from "../../components/dataForm";
import { nullifyEmptyString } from "../../utils";
import { ApiErrorResponse, ApiResponse } from "../global";
import { UserPersonalInfo } from "../user";

export const extractPhonePrefix = (r?: CountrySearchResult) => {
    return r?.phonePrefix ?? "";
}

/*****************************/
/*         Entities          */
/*****************************/

export interface RegisterData {
    email?: string;
    password?: string;
    fursonaName?: string;
    personalUserInformation?: UserPersonalInfo;
}

export interface RegisterResponse extends ApiResponse {
    success: boolean
}

export class RegisterDTOBuilder implements FormDTOBuilder<RegisterData> {
    mapToDTO = (data: FormData) => {
        let personalUserInformation: UserPersonalInfo = {
            firstName:          nullifyEmptyString(data.get('firstName')?.toString ()),
            lastName:           nullifyEmptyString(data.get('lastName')?.toString ()),
            sex:                nullifyEmptyString(data.get('sex')?.toString ()),
            gender:             nullifyEmptyString(data.get('gender')?.toString ()),
            allergies:          nullifyEmptyString(data.get('allergies')?.toString ()),
            fiscalCode:         nullifyEmptyString(data.get('fiscalCode')?.toString ()),
            birthCity:          nullifyEmptyString(data.get('birthCity')?.toString ()),
            birthRegion:        nullifyEmptyString(data.get('birthRegion')?.toString ()),
            birthCountry:       nullifyEmptyString(data.get('birthCountry')?.toString ()),
            birthday:           nullifyEmptyString(data.get('birthday')?.toString ()),
            residenceAddress:   nullifyEmptyString(data.get('residenceAddress')?.toString ()),
            residenceZipCode:   nullifyEmptyString(data.get('residenceZipCode')?.toString ()),
            residenceCity:      nullifyEmptyString(data.get('residenceCity')?.toString ()),
            residenceRegion:    nullifyEmptyString(data.get('residenceRegion')?.toString ()),
            residenceCountry:   nullifyEmptyString(data.get('residenceCountry')?.toString ()),
            prefixPhoneNumber:  nullifyEmptyString(data.get('phonePrefix')?.toString ()),
            phoneNumber:        nullifyEmptyString(data.get('phoneNumber')?.toString ())
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
}