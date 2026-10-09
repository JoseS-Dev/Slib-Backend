import { createZodDto } from "nestjs-zod";
import { updateReportSchema } from '../../../../shared/index.js'

export class UpdateReportDto extends createZodDto(updateReportSchema) {}
