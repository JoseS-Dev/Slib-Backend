import { ApiProperty } from '@nestjs/swagger';

export class ChangeCategoryStatusDto {
  @ApiProperty({
    example: true,
    description: 'Nuevo estado de activación de la categoría',
  })
  isActive!: boolean;
}
