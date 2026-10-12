import { ApiProperty } from '@nestjs/swagger';
import { Subcategory } from '../../subcategory/entities/subcategory.entity.js';

export class CategoryResponse {
  @ApiProperty({
    example: 1,
    description: 'Identificador único de la categoría',
  })
  id!: number;

  @ApiProperty({
    example: 'Ciencia Ficción',
    description: 'Nombre único de la categoría',
  })
  name!: string;

  @ApiProperty({
    example: 'Libros ambientados en futuros imaginarios y tecnología avanzada',
    description: 'Descripción de la categoría',
    required: false,
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    example: true,
    description: 'Indica si la categoría está activa',
  })
  isActive!: boolean;

  @ApiProperty({
    type: () => [Subcategory],
    description: 'Subcategorías asociadas a la categoría',
    required: false,
  })
  subcategories?: Subcategory[];

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación de la categoría',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización de la categoría',
  })
  updatedAt!: Date;
}

export class PaginatedCategoriesResponse {
  @ApiProperty({
    type: [CategoryResponse],
    description: 'Listado de categorías de la página actual',
  })
  data!: CategoryResponse[];

  @ApiProperty({
    example: 8,
    description: 'Número total de categorías activas',
  })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 1, description: 'Número total de páginas' })
  totalPages!: number;
}

export class CategoryDeleteResponse {
  @ApiProperty({
    example: 'Categoria eliminada correctamente',
    description: 'Mensaje de confirmación de la eliminación lógica',
  })
  message!: string;
}

export class CategoryErrorResponse {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'Ya existe una categoria con el mismo nombre',
    description: 'Mensaje descriptivo del error',
  })
  message!: string;

  @ApiProperty({
    example: 'Conflict',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
