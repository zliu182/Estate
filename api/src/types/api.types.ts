import z from "zod";

export const baseReqSchema = z.looseObject({});
export const baseResSchema = z.looseObject({});

export type BaseReq = z.infer<typeof baseReqSchema>;
export type BaseRes = z.infer<typeof baseResSchema>;

export type IRouteMethod<S extends BaseReq, R extends BaseRes> = {
  getPath: () => string;
  schema: () => z.ZodType<BaseReq>;
  process: (props: S) => Promise<R>;
};

export const StaffSchema = z.object({
  branchno: z.string(),
  staffno: z.string(),
  fname: z.string(),
  lname: z.string(),
  position: z.string(),
  sex: z.string(),
  dob: z.string(),
  salary: z.number(),
  telephone: z.string(),
  mobile: z.string(),
  email: z.string(),
});

export type Staff = z.infer<typeof StaffSchema>;

export const GetStaffResponseSchema = baseReqSchema.extend({
  staffs: z.array(StaffSchema),
});

export type GetStaffResponse = z.infer<typeof GetStaffResponseSchema>;
