import { AutoInputFilter, AutoInputSearchResult, filterLoaded } from "../components/autoInput";
import { FormApiAction, FormDTOBuilder } from "../components/dataForm";
import { buildSearchParams } from "../utils";
import { ApiErrorResponse, RequestType, runRequest } from "./global";
import { AutoInputUsersManager, toSearchResult, UserSearchAction } from "./user";

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
        const toReturn: OrderExchangeInitApiData = {
            sourceUserId: parseInt(data.get('userId')!.toString()),
            destUserId: parseInt(data.get('recipientId')!.toString()),
            action: "order"
        };
        return toReturn;
    }
}

export class OrderExchangeFormAction extends FormApiAction<OrderExchangeInitApiData, boolean, ApiErrorResponse> {
    method = RequestType.POST;
    authenticated = true;
    dtoBuilder = new OrderExchangeInitDTOBuilder();
    urlAction = "room/exchange/init";
}

/**
 * Defines the search service for users without orders
 */
export class AutoInputOrderExchangeManager extends AutoInputUsersManager {
    searchByValues(value: string, locale?: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve) => {
            runRequest(new UserSearchAction(), undefined, undefined,
                buildSearchParams({ "name": value, "filter-not-made-an-order": "true" })).then(results => {
                    const users = results.users.map(usr => toSearchResult(usr));
                    resolve(
                        filterLoaded(users, filter, filterOut)
                    );
                });
        });
    }
}