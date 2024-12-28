import { PrismaClient, Prisma } from '@prisma/client';

export const ExtendedPrisma = () =>
  new PrismaClient().$extends({
    model: {
      $allModels: {
        async softDelete<M, A>(
          this: M,
          where: Prisma.Args<M, 'findFirst'>['where'],
          include?: Prisma.Args<M, 'findFirst'>['include'],
        ): Promise<Prisma.Result<M, A, 'findFirst'>> {
          const context = Prisma.getExtensionContext(this);

          return await (context as any).findFirst({ where, include });
        },
      },
    },
    client: {
      async onModuleInit() {
        const context: PrismaClient = Prisma.getExtensionContext(this);
        await context.$connect();
      },
      async onModuleDestroy() {
        const context: PrismaClient = Prisma.getExtensionContext(this);
        await context.$disconnect();
      },
    },
  });

export type ExtendedPrismaClient = ReturnType<typeof ExtendedPrisma>;
