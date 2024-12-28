import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UserDTO } from './user/user.dto';
import { User } from '@prisma/client';
import { Serialize } from 'src/middleware/serialize.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Serialize(UserDTO)
  getHello(): Promise<User> {
    return this.appService.getHello();
  }
}
