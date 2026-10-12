import { ApiProperty } from '@nestjs/swagger';

export class Session {
  @ApiProperty({
    example: 1,
    description: 'Identificador único de la sesión',
  })
  id!: number;

  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario propietario de la sesión',
  })
  userId!: number;

  @ApiProperty({
    example: true,
    description: 'Indica si la sesión está activa',
  })
  isActive!: boolean;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación de la sesión',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización de la sesión',
  })
  updatedAt!: Date;
}
