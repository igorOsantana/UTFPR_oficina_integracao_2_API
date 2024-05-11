import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { PrismaService } from "../database/prisma/prisma.service";
import { hashSync } from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private readonly dbService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.findOne(createUserDto.email);
    if (existingUser !== null) {
      throw new ConflictException("Email already in use");
    }
    const newUser = await this.dbService.users.create({
      data: {
        ...createUserDto,
        password: hashSync(createUserDto.password, 12),
      },
    });
    newUser.password = "";
    return newUser;
  }

  async findOne(email: string) {
    if (!email.includes("@")) {
      throw new BadRequestException("Email invalid");
    }
    const user = await this.dbService.users.findUnique({
      where: { email },
    });
    if (!user) {
      return null;
    }
    return user;
  }
}
