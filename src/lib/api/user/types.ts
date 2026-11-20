import { ApiErrorResponse } from "../networking";
import { UserDisplayResponse } from "./main";

export type GetUserResult = {
  user: UserDisplayResponse | null;
  error: ApiErrorResponse | null;
};
