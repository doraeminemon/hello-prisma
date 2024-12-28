import { Expose, Transform } from 'class-transformer';

export class UserDTO {
  @Expose()
  id: number;

  @Expose()
  @Transform(({ value }) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  })
  createdAt: string;

  @Expose()
  name: string;
}
