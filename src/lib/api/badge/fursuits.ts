import { FormApiAction, FormDTOBuilder } from "../../components/dataForm";
import { ApiAction, ApiErrorResponse } from "../global";
import { MediaData } from "../media";

export interface FursuitDetails {
    id: number,
    name: string,
    species: string,
    propic?: MediaData,
    sponsorship: string
}

export interface Fursuit {
    bringingToEvent: boolean,
    ownerId: number,
    showInFursuitCount: boolean,
    fursuit: FursuitDetails
}

export class AddFursuitDTOBuilder implements FormDTOBuilder<FormData> {
    mapToDTO = (data: FormData) => {
        return data;
    }
}

export class AddFursuitFormAction implements FormApiAction<FormData, Boolean, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST"
    authenticated = true;
    dtoBuilder = new AddFursuitDTOBuilder ();
    urlAction = "fursuits/add-with-image";
    onSuccess: (status: number, body?: Boolean) => void = (status: number, body?: Boolean) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export class EditFursuitFormAction implements FormApiAction<FormData, Boolean, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST"
    authenticated = true;
    dtoBuilder = new AddFursuitDTOBuilder ();
    urlAction = "fursuits";
    onSuccess: (status: number, body?: Boolean) => void = (status: number, body?: Boolean) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export class DeleteFursuitApiAction implements ApiAction<Boolean, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "DELETE"
    authenticated = true;
    urlAction = "fursuits";
    onSuccess: (status: number, body?: Boolean) => void = (status: number, body?: Boolean) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}