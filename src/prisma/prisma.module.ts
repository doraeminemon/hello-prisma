import { Module } from '@nestjs/common';
import { PrismaFactory } from './prisma.service';

@Module({
  imports: [],
  controllers: [],
  providers: [PrismaFactory],
  exports: [PrismaFactory],
})
export class PrismaModule {}
