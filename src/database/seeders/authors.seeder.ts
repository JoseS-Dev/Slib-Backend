import type { Author } from '../../../generated/prisma/client.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

interface AuthorSeed {
  firstName: string;
  lastName: string;
  biography: string;
}

const AUTHOR_CATALOG: ReadonlyArray<AuthorSeed> = [
  { firstName: 'Gabriel',       lastName: 'García Márquez',  biography: 'Escritor colombiano, premio Nobel de Literatura 1982, máximo exponente del realismo mágico.' },
  { firstName: 'Isabel',        lastName: 'Allende',         biography: 'Escritora chilena, autora de "La casa de los espíritus" y otras novelas de realismo mágico.' },
  { firstName: 'Jorge Luis',    lastName: 'Borges',          biography: 'Escritor argentino, uno de los autores más importantes de la literatura del siglo XX.' },
  { firstName: 'Mario',         lastName: 'Vargas Llosa',    biography: 'Escritor peruano-español, premio Nobel de Literatura 2010.' },
  { firstName: 'Julio',         lastName: 'Cortázar',        biography: 'Escritor argentino, autor de "Rayuela" y maestro del cuento fantástico.' },
  { firstName: 'Carlos',        lastName: 'Fuentes',         biography: 'Escritor mexicano, autor de "La región más transparente" y otras novelas fundamentales.' },
  { firstName: 'Pablo',         lastName: 'Neruda',          biography: 'Poeta chileno, premio Nobel de Literatura 1971.' },
  { firstName: 'Octavio',       lastName: 'Paz',             biography: 'Poeta y ensayista mexicano, premio Nobel de Literatura 1990.' },
  { firstName: 'Miguel',        lastName: 'de Cervantes',    biography: 'Escritor español, autor de "El ingenioso hidalgo Don Quijote de la Mancha".' },
  { firstName: 'Federico',      lastName: 'García Lorca',    biography: 'Poeta y dramaturgo español, una de las figuras más importantes de la Generación del 27.' },
  { firstName: 'Stephen',       lastName: 'King',            biography: 'Escritor estadounidense de novelas de terror, fantasía y ciencia ficción.' },
  { firstName: 'Yuval Noah',    lastName: 'Harari',          biography: 'Historiador y profesor israelí, autor de "Sapiens" y "Homo Deus".' },
  { firstName: 'Carl',          lastName: 'Sagan',           biography: 'Astrónomo, astrofísico y divulgador científico estadounidense.' },
  { firstName: 'Yuval',         lastName: 'Peres',           biography: 'Físico teórico israelí, conocido por el algoritmo de factorización cuántica de Shor.' },
  { firstName: 'Brandon',       lastName: 'Sanderson',       biography: 'Escritor estadounidense de fantasía y ciencia ficción, autor del "Cosmere".' },
];

export class AuthorsSeeder {
  constructor(private readonly prisma: PrismaService) {}

  async run(): Promise<Author[]> {
    const created: Author[] = [];

    for (const seed of AUTHOR_CATALOG) {
      const existing = await this.prisma.author.findFirst({
        where: {
          firstName: seed.firstName,
          lastName: seed.lastName,
        },
      });
      if (existing) {
        created.push(existing);
        continue;
      }
      const author = await this.prisma.author.create({
        data: {
          firstName: seed.firstName,
          lastName: seed.lastName,
          biography: seed.biography,
        },
      });
      created.push(author);
    }

    return created;
  }

  async clear(): Promise<number> {
    const deleted = await this.prisma.author.deleteMany({
      where: {
        OR: AUTHOR_CATALOG.map((a) => ({
          firstName: a.firstName,
          lastName: a.lastName,
        })),
      },
    });
    return deleted.count;
  }
}