import { ApiProperty } from '@nestjs/swagger';

export class ChangeUserStatusDto {
  @ApiProperty({
    example: true,
    description: 'Nuevo estado de activación del usuario',
  })
  isActive!: boolean;
}
