import { createZodDto } from "nestjs-zod";
import { createReportSchema } from '../../../../shared/index.js'


export class CreateReportDto extends createZodDto(createReportSchema) {}
