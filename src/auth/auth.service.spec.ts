import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { UsersService } from "../users/users.service";
import { LoginUserDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

const mockUsersService = {
  findOne: jest.fn().mockResolvedValue({
    name: "any user",
    email: "any_user@mail.com",
    password: "hash_password",
  }),
};
const bcryptCompareSpy = jest.spyOn(bcrypt, "compare");
bcryptCompareSpy.mockImplementation(() => Promise.resolve(true));

describe("AuthService", () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Login", () => {
    it("should throw unauthorized exception if does not exists a user with the sent email", async () => {
      const loginUserDto: LoginUserDto = {
        email: "non_existing@mail.com",
        password: "any_password",
      };
      mockUsersService.findOne.mockResolvedValueOnce(null);

      const promise = service.login(loginUserDto);

      await expect(promise).rejects.toThrow(new UnauthorizedException());
      expect(mockUsersService.findOne).toHaveBeenCalledWith(loginUserDto.email);
    });

    it("should throw unauthorized exception if the found user password do not match with the sent password", async () => {
      const loginUserDto: LoginUserDto = {
        email: "any_user@mail.com",
        password: "any_password",
      };
      const existingUser = {
        name: "any user",
        email: "any_user@mail.com",
        password: "hash_password",
      };
      mockUsersService.findOne.mockResolvedValueOnce(existingUser);
      bcryptCompareSpy.mockImplementationOnce(() => Promise.resolve(false));

      const promise = service.login(loginUserDto);

      await expect(promise).rejects.toThrow(new UnauthorizedException());
      expect(bcryptCompareSpy).toHaveBeenCalledWith(
        loginUserDto.password,
        existingUser.password,
      );
    });

    it("should return the access token", async () => {
      const accessToken = "any access token";
      const loginUserDto: LoginUserDto = {
        email: "any_user@mail.com",
        password: "any_password",
      };
      jest.spyOn(jwtService, "sign").mockReturnValueOnce(accessToken);

      const response = await service.login(loginUserDto);

      expect(response.accessToken).toBeTruthy();
      expect(response.accessToken).toBe(accessToken);
    });
  });
});
