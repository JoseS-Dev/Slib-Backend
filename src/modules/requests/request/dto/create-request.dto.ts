import { createZodDto } from "nestjs-zod";
import { createRequestSchema } from "../../../../shared/index.js";

export class CreateRequestDto extends createZodDto(createRequestSchema) {}
