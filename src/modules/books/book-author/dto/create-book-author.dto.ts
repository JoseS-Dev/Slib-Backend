import { createZodDto } from "nestjs-zod";
import { createBookAuthorSchema } from "../../../../shared/index.js";

export class CreateBookAuthorDto extends createZodDto(createBookAuthorSchema) {}
