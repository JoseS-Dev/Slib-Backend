import { createZodDto } from "nestjs-zod";
import { updateAuthorSchema } from '../../../../shared/index.js'

export class UpdateAuthorDto extends createZodDto(updateAuthorSchema) {}
