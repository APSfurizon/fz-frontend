import { FormApiAction, FormDTOBuilder } from "../../components/dataForm";
import { ApiAction, ApiErrorResponse, RequestType } from "../global";
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

export class AddFursuitFormAction extends FormApiAction<FormData, Boolean, ApiErrorResponse> {
    method = RequestType.POST;
    authenticated = true;
    dtoBuilder = new AddFursuitDTOBuilder ();
    urlAction = "fursuits/add-with-image";
}

export class EditFursuitFormAction extends FormApiAction<FormData, Boolean, ApiErrorResponse> {
    method = RequestType.POST;
    authenticated = true;
    dtoBuilder = new AddFursuitDTOBuilder ();
    urlAction = "fursuits";
}

export class DeleteFursuitApiAction extends ApiAction<Boolean, ApiErrorResponse> {
    method = RequestType.DELETE;
    authenticated = true;
    urlAction = "fursuits";
}