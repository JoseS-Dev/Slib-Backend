import { createZodDto } from "nestjs-zod";
import { createNotificationSchema } from '../../../../shared/index.js'

export class CreateNotificationDto extends createZodDto(createNotificationSchema) {}
