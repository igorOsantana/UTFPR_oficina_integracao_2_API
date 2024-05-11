import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  forwardRef,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { PrismaService } from "../database/prisma/prisma.service";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly dbService: PrismaService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.findOne(createUserDto.email);
    if (existingUser !== null) {
      throw new ConflictException("Email already in use");
    }
    const newUser = await this.dbService.users.create({
      data: {
        ...createUserDto,
        password: this.authService.hash(createUserDto.password),
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
