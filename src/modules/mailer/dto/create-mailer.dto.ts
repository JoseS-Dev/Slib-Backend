import { createZodDto } from "nestjs-zod";
import { createMailerSchema, resetPasswordSchema, forgotPasswordSchema } from '../../../shared/index.js';

export class CreateMailerDto extends createZodDto(createMailerSchema) {}
export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {}
export class ForgotPasswordDto extends createZodDto(forgotPasswordSchema) {}
