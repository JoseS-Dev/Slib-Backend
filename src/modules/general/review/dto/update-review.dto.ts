import {createZodDto} from 'nestjs-zod';
import { updateReviewSchema } from '../../../../shared/index.js';

export class UpdateReviewDto extends createZodDto(updateReviewSchema) {}
