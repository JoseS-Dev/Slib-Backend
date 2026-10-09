import { createZodDto } from "nestjs-zod";
import { updateNotificationSchema } from '../../../../shared/index.js'

export class UpdateNotificationDto extends createZodDto(updateNotificationSchema) {}
