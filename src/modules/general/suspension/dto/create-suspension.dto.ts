import {createZodDto} from 'nestjs-zod';
import { createSuspensionSchema } from '../../../../shared/dtos/index.js'

export class CreateSuspensionDto extends createZodDto(createSuspensionSchema) {}
