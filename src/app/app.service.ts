import { Inject, Injectable } from '@nestjs/common';
import { ExtendedPrismaClient } from '../prisma/prisma.client';
import { PRISMA_SERVICE } from 'src/prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prismaService: ExtendedPrismaClient,
  ) {}

  getHello() {
    return this.prismaService.user.softDelete({ id: 1 });
  }
}
