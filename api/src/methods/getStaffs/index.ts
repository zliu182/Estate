import { ZodType } from "zod";
import {
  BaseReq,
  baseReqSchema,
  GetStaffResponse,
  IRouteMethod,
} from "../../types/api.types";
import { getStaffs } from "../../db/containers/staff.js";
import { logInfo } from "../../log/logger.js";

export const getStaffsAPI: IRouteMethod<BaseReq, GetStaffResponse> = {
  getPath: function (): string {
    return "/getStaffs";
  },
  schema: function (): ZodType<BaseReq> {
    return baseReqSchema;
  },
  process: async function (_req: BaseReq) {
    logInfo("getStaffsAPI-staffs");
    return { staffs: await getStaffs() };
  },
};
