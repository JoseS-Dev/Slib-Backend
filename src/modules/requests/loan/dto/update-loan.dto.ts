import { createZodDto } from 'nestjs-zod';
import { updateLoanSchema } from '../../../../shared/dtos/requests/loan/loan.dtos.js';

export class UpdateLoanDto extends createZodDto(updateLoanSchema) {}
