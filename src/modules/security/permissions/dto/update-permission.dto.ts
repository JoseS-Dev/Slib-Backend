import { createZodDto } from "nestjs-zod";
import { updatePermissionDto } from "../../../../shared/index.js";

export class UpdatePermissionDto extends createZodDto(updatePermissionDto) {}
