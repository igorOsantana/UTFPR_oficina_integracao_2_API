import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../database/prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { BadRequestException, ConflictException } from "@nestjs/common";
import { Users } from "@prisma/client";
import { AuthService } from "../auth/auth.service";

const mockAuthService = {
  hash: jest.fn(),
};
const mockPrismaService = {
  users: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe("UsersService", () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Create", () => {
    it("should throw an error if email is already in use", async () => {
      const existingUser = {
        name: "existing user name",
        email: "existing@example.com",
        password: "existing_password",
      };
      const createUserDto: CreateUserDto = {
        name: "any user name",
        email: existingUser.email,
        password: "any_password",
      };
      mockPrismaService.users.findUnique.mockResolvedValueOnce(existingUser);

      const promise = service.create(createUserDto);

      await expect(promise).rejects.toThrow(
        new ConflictException("Email already in use"),
      );
      expect(mockPrismaService.users.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockPrismaService.users.create).not.toHaveBeenCalled();
    });

    it("should hash the password before creating the user", async () => {
      const createUserDto: CreateUserDto = {
        name: "any user name",
        email: "any_user@mail.com",
        password: "any_password",
      };
      const hashedPassword = "hashed_password";
      mockAuthService.hash.mockReturnValueOnce(hashedPassword);
      mockPrismaService.users.create.mockResolvedValueOnce({
        name: "any user name",
        email: "any_user@mail.com",
        password: "any_password",
      });

      await service.create(createUserDto);

      expect(mockPrismaService.users.create).toHaveBeenCalledWith({
        data: { ...createUserDto, password: hashedPassword },
      });
      expect(mockAuthService.hash).toHaveBeenCalledWith(createUserDto.password);
    });

    it("should create a new user", async () => {
      const createUserDto: CreateUserDto = {
        name: "any user name",
        email: "any_user@mail.com",
        password: "any_password",
      };
      const mockUser: Users = {
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
      };
      mockPrismaService.users.create.mockResolvedValue(mockUser);
      const hashedPassword = "hashed_password";
      mockAuthService.hash.mockReturnValueOnce(hashedPassword);

      await service.create(createUserDto);

      expect(mockPrismaService.users.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });
    });

    it("should not return the password field when creating a user", async () => {
      const createUserDto: CreateUserDto = {
        name: "any user name",
        email: "any_user@mail.com",
        password: "any_password",
      };

      const newUser = await service.create(createUserDto);

      expect(newUser.password).toBeFalsy();
    });
  });

  describe("FindOne", () => {
    it("should find an existing user by email", async () => {
      const existingUser = {
        name: "existing user name",
        email: "existing@example.com",
        password: "existing_password",
      };
      mockPrismaService.users.findUnique.mockResolvedValueOnce(existingUser);

      const foundUser = await service.findOne(existingUser.email);

      expect(foundUser).toEqual(existingUser);
      expect(mockPrismaService.users.findUnique).toHaveBeenCalledWith({
        where: { email: existingUser.email },
      });
    });

    it("should return null if user with email does not exist", async () => {
      const nonExistingEmail = "nonexisting@example.com";
      mockPrismaService.users.findUnique.mockResolvedValueOnce(null);

      const foundUser = await service.findOne(nonExistingEmail);

      expect(foundUser).toBeNull();
      expect(mockPrismaService.users.findUnique).toHaveBeenCalledWith({
        where: { email: nonExistingEmail },
      });
    });

    it("should throw a bad request exception if email is invalid", async () => {
      const invalidEmail = "invalid-email";

      const promise = service.findOne(invalidEmail);

      await expect(promise).rejects.toThrow(
        new BadRequestException("Email invalid"),
      );
      expect(mockPrismaService.users.findUnique).not.toHaveBeenCalled();
    });
  });
});
