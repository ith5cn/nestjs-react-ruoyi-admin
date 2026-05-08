import { z } from "zod";
import { ZodDto } from "@/core/decorators/zod-dto.decorator";

export const NestSystemLoginLogSchema = z.object({
  remark: z.string().optional(),
  username: z.string().optional(),
  status: z.number(),
  ip: z.string().optional(),
  ipLocation: z.string().optional(),
  os: z.string().optional(),
  browser: z.string().optional(),
  message: z.string().optional(),
  loginTime: z.string().min(1, "不能为空"),
});

@ZodDto(NestSystemLoginLogSchema)
export class NestSystemLoginLogDto {
  remark?: string;
  username?: string;
  status: number;
  ip?: string;
  ipLocation?: string;
  os?: string;
  browser?: string;
  message?: string;
  loginTime: Date | string;
}
