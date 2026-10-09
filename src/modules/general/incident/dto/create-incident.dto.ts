import {createZodDto} from "nestjs-zod";
import {createIncidentSchema} from '../../../../shared/index.js'

export class CreateIncidentDto extends createZodDto(createIncidentSchema) {}
