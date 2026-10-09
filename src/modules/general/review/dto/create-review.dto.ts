import { createZodDto } from "nestjs-zod";
import { createReviewSchema } from '../../../../shared/index.js'

export class CreateReviewDto extends createZodDto(createReviewSchema) {}
