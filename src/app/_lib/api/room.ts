import { ApiResponse } from "./global";

export interface RoomDataResponse extends ApiResponse {
    roomCapacity: number,
    roomTypeNames: Record<string, string>
}