import { BaseReq, BaseRes, IRouteMethod } from "../types/api.types.js";
import { getStaffsAPI } from "./getStaffs/index.js";

export const routes: IRouteMethod<BaseReq, BaseRes>[] = [getStaffsAPI];
