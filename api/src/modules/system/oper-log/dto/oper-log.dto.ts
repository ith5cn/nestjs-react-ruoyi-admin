import { z } from "zod";
import { ZodDto } from "@/core/decorators/zod-dto.decorator";

export const OperLogSchema = z.object({
  app: z.string().optional(),
  method: z.string().optional(),
  requestData: z.string().optional(),
  remark: z.string().optional(),
  username: z.string().optional(),
  serviceName: z.string().optional(),
  router: z.string().optional(),
  ip: z.string().optional(),
  ipLocation: z.string().optional(),
});

@ZodDto(OperLogSchema)
export class OperLogDto {
  app?: string;
  method?: string;
  requestData?: string;
  remark?: string;
  username?: string;
  serviceName?: string;
  router?: string;
  ip?: string;
  ipLocation?: string;
}
