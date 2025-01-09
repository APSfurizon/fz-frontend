import { FormApiAction, FormDTOBuilder } from "../components/dataForm";
import { ApiErrorResponse } from "./global";

export enum OrderStatus {
    CANCELED = "CANCELED",
    PENDING = "PENDING", 
    PAID = "PAID",
    EXPIRED = "EXPIRED"
}

export interface OrderExchangeInitApiData {
    sourceUserId: number,
    destUserId: number,
    action: "room" | "order"
}

export class OrderExchangeInitDTOBuilder implements FormDTOBuilder<OrderExchangeInitApiData> {
    mapToDTO = (data: FormData) => {
        let toReturn: OrderExchangeInitApiData = {
            sourceUserId: parseInt(data.get('userId')!.toString ()),
            destUserId: parseInt(data.get('recipientId')!.toString()),
            action: "order"
        };
        return toReturn;
    }
}

export class OrderExchangeFormAction implements FormApiAction<OrderExchangeInitApiData, Boolean, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST"
    authenticated = true;
    dtoBuilder = new OrderExchangeInitDTOBuilder ();
    urlAction = "room/exchange/init";
    onSuccess: (status: number, body?: Boolean) => void = (status: number, body?: Boolean) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}