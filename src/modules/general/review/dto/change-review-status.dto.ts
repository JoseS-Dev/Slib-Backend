import { ApiProperty } from '@nestjs/swagger';

export class ChangeReviewStatusDto {
  @ApiProperty({
    example: true,
    description: 'Nuevo estado de activación de la reseña',
  })
  isActive!: boolean;
}
