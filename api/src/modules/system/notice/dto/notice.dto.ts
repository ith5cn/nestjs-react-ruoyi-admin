import { z } from "zod";
import { ZodDto } from "@/core/decorators/zod-dto.decorator";

export const NoticeSchema = z.object({
  messageId: z.number().optional(),
  title: z.string().optional(),
  type: z.number().optional(),
  content: z.string().optional(),
  clickNum: z.number().optional(),
  remark: z.string().optional(),
});

@ZodDto(NoticeSchema)
export class NoticeDto {
  messageId?: number;
  title?: string;
  type?: number;
  content?: string;
  clickNum?: number;
  remark?: string;
}
