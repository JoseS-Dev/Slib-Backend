import type { Book, Category, Publisher, Subcategory } from '../../../generated/prisma/client.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

interface BookSeed {
  title: string;
  isbn: string;
  description: string;
  categoryName: string;
  subcategoryName?: string;
  publisherName: string;
  authorIndexes: number[];
  year: number;
}

// Cada tupla = (1, 2-3 autores) usando los índices del AUTHOR_CATALOG en authors.seeder.ts
const BOOK_CATALOG: ReadonlyArray<BookSeed> = [
  { title: 'Cien años de soledad',          isbn: '9780307474728', description: 'La saga de la familia Buendía en Macondo, obra cumbre del realismo mágico.',                categoryName: 'Literatura', subcategoryName: 'Novela Histórica',  publisherName: 'Editorial Sudamericana',  authorIndexes: [0],                       year: 1967 },
  { title: 'La casa de los espíritus',      isbn: '9781501117015', description: 'Primera novela de Isabel Allende, narra la vida de la familia Trueba a lo largo de generaciones.', categoryName: 'Literatura', publisherName: 'Alfaguara',                 authorIndexes: [1],                       year: 1982 },
  { title: 'Rayuela',                       isbn: '9788437604572', description: 'Novela experimental que puede leerse en múltiples órdenes.',                                categoryName: 'Literatura', subcategoryName: 'Novela Histórica',  publisherName: 'Editorial Sudamericana',  authorIndexes: [4],                       year: 1963 },
  { title: 'El amor en los tiempos del cólera', isbn: '9780307389732', description: 'Una historia de amor que perdura más de cincuenta años.',                              categoryName: 'Ficción',    subcategoryName: 'Realismo Mágico',   publisherName: 'Editorial Planeta',        authorIndexes: [0],                       year: 1985 },
  { title: 'La ciudad y los perros',        isbn: '9788420471839', description: 'Primera novela de Vargas Llosa, retrato de la vida en un colegio militar limeño.',         categoryName: 'Ficción',    subcategoryName: 'Realismo Mágico',   publisherName: 'Alfaguara',                 authorIndexes: [3],                       year: 1963 },
  { title: 'Pedro Páramo',                  isbn: '9789685208550', description: 'Novela corta de Juan Rulfo sobre un pueblo fantasma habitado por almas en pena.',         categoryName: 'Ficción',    subcategoryName: 'Realismo Mágico',   publisherName: 'Fondo de Cultura Económica', authorIndexes: [],                       year: 1955 },
  { title: 'Ficciones',                     isbn: '9780142437256', description: 'Recopilación de cuentos donde Borges explora laberintos, bibliotecas infinitas y espejos.', categoryName: 'Ficción',    subcategoryName: 'Realismo Mágico',   publisherName: 'Editorial Sudamericana',  authorIndexes: [2],                       year: 1944 },
  { title: 'Sapiens: De animales a dioses', isbn: '9788499924211', description: 'Breve historia de la humanidad desde la revolución cognitiva hasta el presente.',          categoryName: 'Ciencia',    subcategoryName: 'Divulgación Científica', publisherName: 'Océano',                authorIndexes: [11],                      year: 2011 },
  { title: 'Homo Deus: Breve historia del mañana', isbn: '9781784703936', description: 'Una mirada al futuro de la humanidad a partir de sus logros pasados.',           categoryName: 'Ciencia',    subcategoryName: 'Divulgación Científica', publisherName: 'Océano',                authorIndexes: [11],                      year: 2015 },
  { title: 'Cosmos',                        isbn: '9780345539434', description: 'Recorrido por el universo y la historia de la exploración espacial.',                     categoryName: 'Ciencia',    subcategoryName: 'Divulgación Científica', publisherName: 'Ediciones Akal',         authorIndexes: [12],                      year: 1980 },
  { title: 'It',                            isbn: '9781501142970', description: 'Novela de terror ambientada en el pueblo ficticio de Derry.',                             categoryName: 'Ficción',    subcategoryName: 'Fantasía',          publisherName: 'Penguin Random House',    authorIndexes: [10],                      year: 1986 },
  { title: 'El resplandor',                 isbn: '9780307743659', description: 'Un escritor acepta un empleo como cuidador de un hotel aislado.',                          categoryName: 'Ficción',    subcategoryName: 'Terror',           publisherName: 'Penguin Random House',    authorIndexes: [10],                      year: 1977 },
  { title: 'El nombre del viento',          isbn: '9788401352836', description: 'Primera entrega de la saga Crónica del Asesino de Reyes.',                                categoryName: 'Ficción',    subcategoryName: 'Fantasía',          publisherName: 'Editorial Planeta',        authorIndexes: [14],                      year: 2007 },
  { title: 'Don Quijote de la Mancha',     isbn: '9788424116057', description: 'Las aventuras del ingenioso hidalgo manchego.',                                          categoryName: 'Literatura', subcategoryName: 'Novela Histórica',  publisherName: 'Editorial Planeta',        authorIndexes: [8],                       year: 1605 },
  { title: 'Veinte poemas de amor y una canción desesperada', isbn: '9788432244251', description: 'Poemario de juventud de Pablo Neruda, uno de los más leídos de la lengua española.', categoryName: 'Literatura', subcategoryName: 'Poesía',           publisherName: 'Editorial Planeta',        authorIndexes: [6],                       year: 1924 },
  { title: 'El laberinto de la soledad',    isbn: '9789685208888', description: 'Ensayo sobre la identidad mexicana escrito por Octavio Paz.',                             categoryName: 'Literatura', subcategoryName: 'Ensayo',           publisherName: 'Fondo de Cultura Económica', authorIndexes: [7],                       year: 1950 },
  { title: 'Bodas de sangre',               isbn: '9788437604817', description: 'Tragedia rural en verso de Federico García Lorca.',                                       categoryName: 'Literatura', subcategoryName: 'Teatro',           publisherName: 'Editorial Planeta',        authorIndexes: [9],                       year: 1933 },
  { title: 'Programación en Python',        isbn: '9788441540493', description: 'Manual introductorio a la programación con Python.',                                    categoryName: 'Tecnología', subcategoryName: 'Programación',     publisherName: 'Anagrama',                  authorIndexes: [],                       year: 2020 },
  { title: 'Inteligencia artificial: un enfoque moderno', isbn: '9780134610993', description: 'Texto clásico de IA usado en universidades de todo el mundo.',               categoryName: 'Tecnología', subcategoryName: 'Inteligencia Artificial', publisherName: 'Ediciones Akal',      authorIndexes: [13],                      year: 2021 },
  { title: 'La historia del arte',          isbn: '9783836543829', description: 'Recorrido por las principales corrientes artísticas occidentales.',                        categoryName: 'Arte',       subcategoryName: 'Pintura',          publisherName: 'Océano',                    authorIndexes: [],                       year: 2012 },
  { title: 'Historia de América Latina',    isbn: '9788437506487', description: 'Síntesis de la historia política, económica y social del subcontinente.',                categoryName: 'Historia',   subcategoryName: 'Historia de América', publisherName: 'Fondo de Cultura Económica', authorIndexes: [],                       year: 1999 },
  { title: 'Cuentos completos',             isbn: '9788420474014', description: 'Recopilación de la narrativa breve de Borges en un solo volumen.',                        categoryName: 'Literatura', subcategoryName: 'Cuentos',          publisherName: 'Editorial Sudamericana',  authorIndexes: [2],                       year: 1998 },
];

export class BooksSeeder {
  constructor(private readonly prisma: PrismaService) {}

  async run(
    categories: Category[],
    publishers: Publisher[],
    subcategories: Subcategory[],
  ): Promise<{ books: Book[]; authorIndexesByIsbn: Map<string, number[]> }> {
    const categoryByName = new Map(categories.map((c) => [c.name, c]));
    const subcategoryByName = new Map(
      subcategories.map((s) => [s.name, s] as const),
    );
    const publisherByName = new Map(publishers.map((p) => [p.name, p]));

    const created: Book[] = [];
    const authorIndexesByIsbn = new Map<string, number[]>();

    for (const seed of BOOK_CATALOG) {
      const category = categoryByName.get(seed.categoryName);
      const publisher = publisherByName.get(seed.publisherName);
      const subcategory = seed.subcategoryName
        ? subcategoryByName.get(seed.subcategoryName)
        : undefined;

      if (!category || !publisher) continue;

      const existing = await this.prisma.book.findUnique({
        where: { isbn: seed.isbn },
      });
      if (existing) {
        created.push(existing);
        authorIndexesByIsbn.set(existing.isbn, seed.authorIndexes);
        continue;
      }

      const datePublished = new Date(Date.UTC(seed.year, 0, 1));
      const book = await this.prisma.book.create({
        data: {
          title: seed.title,
          isbn: seed.isbn,
          description: seed.description,
          datePublished,
          categoryId: category.id,
          subcategoryId: subcategory?.id ?? null,
          publisherId: publisher.id,
        },
      });
      created.push(book);
      authorIndexesByIsbn.set(book.isbn, seed.authorIndexes);
    }

    return { books: created, authorIndexesByIsbn };
  }

  async clear(): Promise<number> {
    const deleted = await this.prisma.book.deleteMany({
      where: { isbn: { in: BOOK_CATALOG.map((b) => b.isbn) } },
    });
    return deleted.count;
  }
}