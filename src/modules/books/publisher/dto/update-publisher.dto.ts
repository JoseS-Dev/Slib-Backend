import { createZodDto } from "nestjs-zod";
import { updatePublisherSchema } from "../../../../shared/index.js";

export class UpdatePublisherDto extends createZodDto(updatePublisherSchema) {}