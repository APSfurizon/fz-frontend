import { CountrySearchResult } from "@/lib/api/geo";
import { FormApiAction, FormDTOBuilder, getData } from "../../components/dataForm";
import { ApiErrorResponse, ApiResponse, RequestType } from "../global";
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
        const personalUserInformation: UserPersonalInfo = {
            firstName:          getData(data, 'firstName'),
            lastName:           getData(data, 'lastName'),
            sex:                getData(data, 'sex'),
            gender:             getData(data, 'gender'),
            allergies:          getData(data, 'allergies'),
            fiscalCode:         getData(data, 'fiscalCode'),
            birthCity:          getData(data, 'birthCity'),
            birthRegion:        getData(data, 'birthRegion'),
            birthCountry:       getData(data, 'birthCountry'),
            birthday:           getData(data, 'birthday'),
            residenceAddress:   getData(data, 'residenceAddress'),
            residenceZipCode:   getData(data, 'residenceZipCode'),
            residenceCity:      getData(data, 'residenceCity'),
            residenceRegion:    getData(data, 'residenceRegion'),
            residenceCountry:   getData(data, 'residenceCountry'),
            prefixPhoneNumber:  getData(data, 'phonePrefix'),
            phoneNumber:        getData(data, 'phoneNumber'),
            telegramUsername:   getData(data, 'telegramUsername'),
            idType:             getData(data, "idType"),
            idNumber:           getData(data, "idNumber"),
            idIssuer:           getData(data, "idIssuer"),
            idExpiry:           getData(data, "idExpiry"),
            shirtSize:          getData(data, "shirtSize")
        };

        const toReturn: RegisterData = {
            email:              data.get('email')?.toString (),
            password:           data.get('password')?.toString (),
            fursonaName:        data.get('fursonaName')?.toString(),
            personalUserInformation: personalUserInformation
        };
        return toReturn;
    }
}

export class RegisterFormAction extends FormApiAction<RegisterData, RegisterResponse, ApiErrorResponse> {
    method = RequestType.POST;
    authenticated = false;
    dtoBuilder = new RegisterDTOBuilder ();
    urlAction = "authentication/register";
}