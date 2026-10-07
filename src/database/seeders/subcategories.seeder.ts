import type { Category, Subcategory } from '../../../generated/prisma/client.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

interface SubcategorySeed {
  categoryName: string;
  name: string;
  description: string;
}

const SUBCATEGORY_CATALOG: ReadonlyArray<SubcategorySeed> = [
  // Ficción
  { categoryName: 'Ficción',    name: 'Distopía',            description: 'Sociedades futuristas con rasgos negativos.' },
  { categoryName: 'Ficción',    name: 'Realismo Mágico',     description: 'Narrativa con elementos fantásticos en contexto realista.' },
  { categoryName: 'Ficción',    name: 'Novela Histórica',    description: 'Ficción ambientada en periodos históricos reales.' },
  { categoryName: 'Ficción',    name: 'Fantasía',            description: 'Mundos imaginarios y sistemas mágicos.' },

  // Ciencia
  { categoryName: 'Ciencia',    name: 'Divulgación Científica', description: 'Textos de ciencia para público general.' },
  { categoryName: 'Ciencia',    name: 'Matemáticas',         description: 'Libros de matemáticas y lógica.' },
  { categoryName: 'Ciencia',    name: 'Física',              description: 'Textos sobre física teórica y aplicada.' },
  { categoryName: 'Ciencia',    name: 'Biología',            description: 'Estudios sobre organismos y ecosistemas.' },

  // Historia
  { categoryName: 'Historia',   name: 'Historia Universal',  description: 'Hechos históricos a nivel mundial.' },
  { categoryName: 'Historia',   name: 'Historia de América', description: 'Procesos históricos del continente americano.' },
  { categoryName: 'Historia',   name: 'Historia Contemporánea', description: 'Acontecimientos del siglo XX y XXI.' },

  // Literatura
  { categoryName: 'Literatura', name: 'Poesía',              description: 'Poesía lírica, épica y contemporánea.' },
  { categoryName: 'Literatura', name: 'Ensayo',              description: 'Textos argumentativos y de opinión.' },
  { categoryName: 'Literatura', name: 'Teatro',              description: 'Obras dramáticas y guiones.' },
  { categoryName: 'Literatura', name: 'Cuentos',             description: 'Narrativa breve.' },

  // Infantil
  { categoryName: 'Infantil',   name: 'Cuentos Infantiles',  description: 'Historias ilustradas para primeros lectores.' },
  { categoryName: 'Infantil',   name: 'Literatura Juvenil',  description: 'Novelas y cuentos para adolescentes.' },
  { categoryName: 'Infantil',   name: 'Didácticos',          description: 'Material educativo para niños.' },

  // Académico
  { categoryName: 'Académico',  name: 'Textos Universitarios', description: 'Manuales y libros de texto universitarios.' },
  { categoryName: 'Académico',  name: 'Investigación',       description: 'Metodología y resultados de investigación.' },
  { categoryName: 'Académico',  name: 'Tesis',               description: 'Trabajos de grado y tesis académicas.' },

  // Arte
  { categoryName: 'Arte',       name: 'Pintura',             description: 'Historia y técnica de la pintura.' },
  { categoryName: 'Arte',       name: 'Música',              description: 'Teoría musical, géneros y composición.' },
  { categoryName: 'Arte',       name: 'Arquitectura',        description: 'Diseño, estilos y teoría arquitectónica.' },
  { categoryName: 'Arte',       name: 'Cine',                description: 'Historia y crítica cinematográfica.' },

  // Tecnología
  { categoryName: 'Tecnología', name: 'Programación',        description: 'Lenguajes, patrones y buenas prácticas de código.' },
  { categoryName: 'Tecnología', name: 'Inteligencia Artificial', description: 'Machine learning, deep learning y aplicaciones.' },
  { categoryName: 'Tecnología', name: 'Redes',               description: 'Redes de computadoras y conectividad.' },
];

export class SubcategoriesSeeder {
  constructor(private readonly prisma: PrismaService) {}

  async run(categories: Category[]): Promise<Subcategory[]> {
    const byName = new Map(categories.map((c) => [c.name, c]));
    const created: Subcategory[] = [];

    for (const seed of SUBCATEGORY_CATALOG) {
      const category = byName.get(seed.categoryName);
      if (!category) continue;

      const existing = await this.prisma.subcategory.findUnique({
        where: { name: seed.name },
      });
      if (existing) {
        created.push(existing);
        continue;
      }

      const subcategory = await this.prisma.subcategory.create({
        data: {
          categoryId: category.id,
          name: seed.name,
          description: seed.description,
        },
      });
      created.push(subcategory);
    }

    return created;
  }

  async clear(): Promise<number> {
    const deleted = await this.prisma.subcategory.deleteMany({
      where: { name: { in: SUBCATEGORY_CATALOG.map((s) => s.name) } },
    });
    return deleted.count;
  }
}