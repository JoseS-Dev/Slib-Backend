import { createZodDto } from "nestjs-zod";
import { updateUserDto } from '../../../../shared/index.js';

export class UpdateUserDto extends createZodDto(updateUserDto) {}
