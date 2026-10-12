import { ApiProperty } from '@nestjs/swagger';

export class ChangeReportStatusDto {
  @ApiProperty({
    example: 1,
    description:
      'Nuevo estado del reporte (1 = activo, 0 = inactivo). Se recibe como número',
  })
  isActive!: boolean;
}
