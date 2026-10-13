import { ApiProperty } from '@nestjs/swagger';

export class Mailer {
  @ApiProperty({
    example: true,
    description: 'Indica si la operación de envío de correo fue exitosa',
  })
  success!: boolean;

  @ApiProperty({
    example: 'Correo de bienvenida enviado correctamente',
    description: 'Mensaje descriptivo del resultado de la operación',
  })
  message!: string;
}
