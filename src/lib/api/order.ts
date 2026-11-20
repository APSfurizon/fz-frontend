import { AutoInputFilter, AutoInputSearchResult, filterLoaded } from "../components/autoInput";
import { buildSearchParams } from "../utils";
import { runRequest } from "./networking/main";
import { AutoInputUsersManager, toSearchResult, UserSearchAction } from "./user/main";

export enum OrderStatus {
  CANCELED = "CANCELED",
  PENDING = "PENDING",
  PAID = "PAID",
  EXPIRED = "EXPIRED",
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
