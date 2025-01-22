import { Fursuit, FursuitDetails } from "./badge/fursuits";
import { ApiAction, ApiErrorResponse, ApiResponse } from "./global";

export interface FursuitCountResponse extends ApiResponse {
    fursuits: FursuitDetails[]
}

export class FursuitCountApiAction implements ApiAction<FursuitCountResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "counts/fursuit";
    onSuccess: (status: number, body?: FursuitCountResponse) => void = (status: number, body?: FursuitCountResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}