import { ApiProperty } from '@nestjs/swagger';

export class SubcategoryResponse {
  @ApiProperty({
    example: 1,
    description: 'Identificador único de la subcategoría',
  })
  id!: number;

  @ApiProperty({
    example: 1,
    description: 'Identificador de la categoría a la que pertenece',
  })
  categoryId!: number;

  @ApiProperty({
    example: 'Ciberpunk',
    description: 'Nombre único de la subcategoría',
  })
  name!: string;

  @ApiProperty({
    example: 'Subgénero distópico de ciencia ficción',
    description: 'Descripción de la subcategoría',
    required: false,
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    example: true,
    description: 'Indica si la subcategoría está activa',
  })
  isActive!: boolean;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación de la subcategoría',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización de la subcategoría',
  })
  updatedAt!: Date;
}

export class PaginatedSubcategoriesResponse {
  @ApiProperty({
    type: [SubcategoryResponse],
    description: 'Listado de subcategorías de la página actual',
  })
  data!: SubcategoryResponse[];

  @ApiProperty({
    example: 28,
    description: 'Número total de subcategorías activas',
  })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 3, description: 'Número total de páginas' })
  totalPages!: number;
}

export class SubcategoryDeleteResponse {
  @ApiProperty({
    example: 'Subcategoria eliminada correctamente',
    description: 'Mensaje de confirmación de la eliminación lógica',
  })
  message!: string;
}

export class SubcategoryErrorResponse {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'Ya existe una subcategoria con el mismo nombre',
    description: 'Mensaje descriptivo del error',
  })
  message!: string;

  @ApiProperty({
    example: 'Conflict',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
