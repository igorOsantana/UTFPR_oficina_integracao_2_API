import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { hashSync, compare } from "bcrypt";
import { LoginUserDto } from "./dto/login.dto";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  hash(input: string) {
    return hashSync(input, 12);
  }

  async compareHash(input: string, hash: string) {
    return await compare(input, hash);
  }

  createJwtToken(email: string) {
    const payload = { sub: email };
    return this.jwtService.sign(payload);
  }

  async login(credentials: LoginUserDto) {
    const existingUser = await this.usersService.findOne(credentials.email);
    if (!existingUser) {
      throw new UnauthorizedException();
    }
    const passwordsMatch = await this.compareHash(
      credentials.password,
      existingUser.password,
    );
    if (!passwordsMatch) {
      throw new UnauthorizedException();
    }
    return { accessToken: this.createJwtToken(credentials.email) };
  }
}
