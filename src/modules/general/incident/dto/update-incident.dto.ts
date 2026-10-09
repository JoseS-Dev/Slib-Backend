import { createZodDto } from "nestjs-zod";
import {updateIncidentSchema} from '../../../../shared/index.js'

export class UpdateIncidentDto extends createZodDto(updateIncidentSchema) {}
