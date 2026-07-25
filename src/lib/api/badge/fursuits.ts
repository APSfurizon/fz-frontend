import { FormApiAction, FormDTOBuilder } from "../../components/dataForm";
import { ApiAction, ApiErrorResponse, RequestType } from "../networking/types";

export class AddFursuitDTOBuilder implements FormDTOBuilder<FormData> {
  mapToDTO = (data: FormData) => data;
}

export class AddFursuitFormAction extends FormApiAction<FormData, boolean, ApiErrorResponse> {
  method = RequestType.POST;
  authenticated = true;
  dtoBuilder = new AddFursuitDTOBuilder();
  urlAction = "fursuits/add-with-image";
}

export class EditFursuitFormAction extends FormApiAction<FormData, boolean, ApiErrorResponse> {
  method = RequestType.POST;
  authenticated = true;
  dtoBuilder = new AddFursuitDTOBuilder();
  hasPathParams = true;
  urlAction = "fursuits/{id}/update-with-image";
}

export class DeleteFursuitApiAction extends ApiAction<boolean, ApiErrorResponse> {
  method = RequestType.DELETE;
  authenticated = true;
  hasPathParams = true;
  urlAction = "fursuits/{id}";
}

export class BringFursuitToEventApiAction extends ApiAction<boolean, ApiErrorResponse> {
  method = RequestType.POST;
  authenticated = true;
  hasPathParams = true;
  urlAction = "fursuits/{id}/bringToEvent";
}
