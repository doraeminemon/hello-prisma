import { SetMetadata } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';

export const SerializerKey = 'SERIALIZER';

export const Serialize = (dto: ClassConstructor<any>) =>
  SetMetadata(SerializerKey, dto);
