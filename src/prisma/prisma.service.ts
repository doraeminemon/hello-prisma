import { ExtendedPrisma } from './prisma.client';

export const PRISMA_SERVICE = 'PRISMA_SERVICE';

export const PrismaFactory = {
  provide: PRISMA_SERVICE,
  useFactory: ExtendedPrisma,
};
