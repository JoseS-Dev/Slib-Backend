import { ApiProperty } from '@nestjs/swagger';

export class MailerSuccessResponse {
  @ApiProperty({
    example: true,
    description: 'Indica si la operación se ejecutó correctamente',
  })
  success!: boolean;

  @ApiProperty({
    example: 'Correo de bienvenida enviado correctamente',
    description: 'Mensaje descriptivo del resultado de la operación',
  })
  message!: string;
}

export class MailerErrorResponse {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'Email y token son requeridos',
    description: 'Mensaje descriptivo del error',
  })
  message!: string;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
