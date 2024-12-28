import { ClassConstructor } from 'class-transformer';

export const Serialize = (dto: ClassConstructor<any>) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('dtoType', dto, descriptor.value);
    return descriptor;
  };
};
