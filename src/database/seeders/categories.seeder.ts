import type { Category } from '../../../generated/prisma/client.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

interface CategorySeed {
  name: string;
  description: string;
}

const CATEGORY_CATALOG: ReadonlyArray<CategorySeed> = [
  { name: 'Ficción',        description: 'Obras narrativas creadas a partir de la inventiva del autor.' },
  { name: 'Ciencia',        description: 'Libros de divulgación y textos científicos.' },
  { name: 'Historia',       description: 'Obras sobre hechos y procesos históricos.' },
  { name: 'Literatura',     description: 'Poesía, ensayo, teatro y demás expresiones literarias.' },
  { name: 'Infantil',       description: 'Material de lectura para niños y jóvenes.' },
  { name: 'Académico',      description: 'Textos universitarios y materiales de investigación.' },
  { name: 'Arte',           description: 'Libros sobre pintura, música, arquitectura y cine.' },
  { name: 'Tecnología',     description: 'Programación, redes, inteligencia artificial y afines.' },
];

export class CategoriesSeeder {
  constructor(private readonly prisma: PrismaService) {}

  async run(): Promise<Category[]> {
    const created: Category[] = [];

    for (const seed of CATEGORY_CATALOG) {
      const existing = await this.prisma.category.findUnique({
        where: { name: seed.name },
      });
      if (existing) {
        created.push(existing);
        continue;
      }
      const category = await this.prisma.category.create({
        data: {
          name: seed.name,
          description: seed.description,
        },
      });
      created.push(category);
    }

    return created;
  }

  async clear(): Promise<number> {
    const deleted = await this.prisma.category.deleteMany({
      where: { name: { in: CATEGORY_CATALOG.map((c) => c.name) } },
    });
    return deleted.count;
  }
}