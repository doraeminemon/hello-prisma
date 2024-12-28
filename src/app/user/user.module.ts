import { Module } from '@nestjs/common';
import { UserDTO } from './user.dto';

@Module({
  exports: [UserDTO],
})
export class UserModule {}
