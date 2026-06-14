import { AutoInputFilter, AutoInputSearchResult, filterLoaded } from "../components/autoInput";
import { FormApiAction, FormDTOBuilder, getData } from "../components/dataForm";
import { buildSearchParams } from "../utils";
import { runRequest } from "./networking/main";
import { ApiErrorResponse } from "./networking/types";
import { RequestType } from "./networking/types";
import { AutoInputUsersManager, toSearchResult, UserSearchAction } from "./user";

export enum OrderStatus {
  CANCELED = "CANCELED",
  PENDING = "PENDING",
  PAID = "PAID",
  EXPIRED = "EXPIRED",
}

export interface OrderExchangeInitApiData {
  sourceUserId: number;
  destUserId: number;
  action: "room" | "order";
}

export class OrderExchangeInitDTOBuilder implements FormDTOBuilder<OrderExchangeInitApiData> {
  mapToDTO = (data: FormData) => {
    const toReturn: OrderExchangeInitApiData = {
      sourceUserId: parseInt(getData(data, "userId")!),
      destUserId: parseInt(getData(data, "recipientId")!),
      action: "order",
    };
    return toReturn;
  };
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
  searchByValues(
    value: string,
    locale?: string,
    filter?: AutoInputFilter,
    filterOut?: AutoInputFilter
  ): Promise<AutoInputSearchResult[]> {
    return new Promise((resolve) => {
      runRequest({
        action: new UserSearchAction(),
        searchParams: buildSearchParams({ name: value, "filter-not-made-an-order": "true" }),
      })
        .then((results) => {
          const users = results.users.map((usr) => toSearchResult(usr));
          resolve(filterLoaded(users, filter, filterOut));
        })
        .catch(() => {
          throw new Error("Unexpected error");
        });
    });
  }
}
