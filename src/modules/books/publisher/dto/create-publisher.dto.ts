import { createZodDto } from "nestjs-zod";
import { createPublisherSchema } from "../../../../shared/index.js";

export class CreatePublisherDto extends createZodDto(createPublisherSchema) {}
