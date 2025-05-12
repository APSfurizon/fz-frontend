import { FormApiAction, FormDTOBuilder } from "../../components/dataForm";
import { ApiAction, ApiErrorResponse, RequestType } from "../global";
import { MediaData } from "../media";
import { SponsorType } from "../user";

export interface FursuitDetails {
    id: number,
    name: string,
    species: string,
    propic?: MediaData,
    sponsorship: SponsorType
}

export interface Fursuit {
    bringingToEvent: boolean,
    ownerId: number,
    showInFursuitCount: boolean,
    showOwner: boolean,
    fursuit: FursuitDetails
}

export class AddFursuitDTOBuilder implements FormDTOBuilder<FormData> {
    mapToDTO = (data: FormData) => data;
}

export class AddFursuitFormAction extends FormApiAction<FormData, boolean, ApiErrorResponse> {
    method = RequestType.POST;
    authenticated = true;
    dtoBuilder = new AddFursuitDTOBuilder ();
    urlAction = "fursuits/add-with-image";
}

export class EditFursuitFormAction extends FormApiAction<FormData, boolean, ApiErrorResponse> {
    method = RequestType.POST;
    authenticated = true;
    dtoBuilder = new AddFursuitDTOBuilder ();
    urlAction = "fursuits";
}

export class DeleteFursuitApiAction extends ApiAction<boolean, ApiErrorResponse> {
    method = RequestType.DELETE;
    authenticated = true;
    urlAction = "fursuits";
}