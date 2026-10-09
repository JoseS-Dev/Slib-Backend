import {createZodDto} from 'nestjs-zod';
import { updateSuspensionSchema } from '../../../../shared/dtos/index.js'

export class UpdateSuspensionDto extends createZodDto(updateSuspensionSchema) {}
