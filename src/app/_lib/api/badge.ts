import { FormApiAction, FormDTOBuilder } from "../components/dataForm";
import { BadgeUploadResponse } from "../components/upload";
import { ApiErrorResponse, ApiResponse } from "./global";
import { MediaData } from "./media";

export interface Fursuit {
    id: number,
    name: string,
    species: string,
    media?: MediaData
}

export interface BadgeStatusApiResponse extends ApiResponse {
    badgeEditingDeadline: string,
    fursonaName: string,
    badgeMedia: MediaData
    fursuits: Fursuit[]
}

export interface FursonaNameChangeData {
    name: string
};

export class FursonaNameChangeDTOBuilder implements FormDTOBuilder<FursonaNameChangeData> {
    mapToDTO = (data: FormData) => {
        let toReturn: FursonaNameChangeData = {
            name: data.get('name')?.toString () ?? ""
        };
        return toReturn;
    }
}

export class FursonaNameChangeFormAction implements FormApiAction<FursonaNameChangeData, Boolean, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST"
    authenticated = true;
    dtoBuilder = new FursonaNameChangeDTOBuilder ();
    urlAction = "room/change-name";
    onSuccess: (status: number, body?: Boolean) => void = (status: number, body?: Boolean) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}