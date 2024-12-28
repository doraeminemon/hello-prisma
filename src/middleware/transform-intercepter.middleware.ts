import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        const dtoType = Reflect.getMetadata('dtoType', context.getHandler());
        console.log({
          handler: context.getHandler(),
          dtoType,
          data,
          type: (data as any).createdAt instanceof Date,
        });
        return plainToClass(dtoType, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
