import { createZodDto } from 'nestjs-zod';
import { createLoanSchema } from '../../../../shared/dtos/requests/loan/loan.dtos.js';

export class CreateLoanDto extends createZodDto(createLoanSchema) {}
