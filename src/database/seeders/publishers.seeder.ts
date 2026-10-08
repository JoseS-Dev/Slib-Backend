import type { Publisher } from '../../../generated/prisma/client.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

interface PublisherSeed {
  name: string;
  description: string;
}

const PUBLISHER_CATALOG: ReadonlyArray<PublisherSeed> = [
  { name: 'Editorial Planeta',         description: 'Grupo editorial español con presencia internacional.' },
  { name: 'Penguin Random House',      description: 'Editorial líder en libros de ficción y no ficción.' },
  { name: 'Anagrama',                  description: 'Editorial independiente de literatura contemporánea.' },
  { name: 'Alfaguara',                 description: 'Sello de Penguin Random House especializado en literatura hispana.' },
  { name: 'Editorial Sudamericana',    description: 'Editorial argentina con amplio catálogo literario.' },
  { name: 'Fondo de Cultura Económica', description: 'Editorial mexicana-académica con presencia en toda Latinoamérica.' },
  { name: 'Océano',                    description: 'Editorial especializada en libros ilustrados y de referencia.' },
  { name: 'Ediciones Akal',            description: 'Editorial académica y de pensamiento.' },
];

export class PublishersSeeder {
  constructor(private readonly prisma: PrismaService) {}

  async run(): Promise<Publisher[]> {
    const created: Publisher[] = [];

    for (const seed of PUBLISHER_CATALOG) {
      const existing = await this.prisma.publisher.findUnique({
        where: { name: seed.name },
      });
      if (existing) {
        created.push(existing);
        continue;
      }
      const publisher = await this.prisma.publisher.create({
        data: {
          name: seed.name,
          description: seed.description,
        },
      });
      created.push(publisher);
    }

    return created;
  }

  async clear(): Promise<number> {
    const deleted = await this.prisma.publisher.deleteMany({
      where: { name: { in: PUBLISHER_CATALOG.map((p) => p.name) } },
    });
    return deleted.count;
  }
}