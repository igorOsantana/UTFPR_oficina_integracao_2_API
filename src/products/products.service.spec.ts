import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../database/prisma/prisma.service";
import { ConflictException } from "@nestjs/common";
import { Products } from "@prisma/client";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";

const mockPrismaService = {
  products: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe("ProductsService", () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Create", () => {
    it("should throw an error if name is already in use", async () => {
      const existingProduct = {
        id: "any-product-id",
        name: "any product name",
        quantity: 2,
      };
      const createProductDto: CreateProductDto = {
        name: existingProduct.name,
        quantity: 5,
      };
      mockPrismaService.products.findUnique.mockResolvedValueOnce(
        existingProduct,
      );

      const promise = service.create(createProductDto);

      await expect(promise).rejects.toThrow(
        new ConflictException("Name already in use"),
      );
      expect(mockPrismaService.products.findUnique).toHaveBeenCalledWith({
        where: { name: createProductDto.name },
      });
      expect(mockPrismaService.products.create).not.toHaveBeenCalled();
    });

    it("should create a new product", async () => {
      const createProjectDto: CreateProductDto = {
        name: "any product name",
        quantity: 4,
      };
      const mockProduct: Products = {
        id: "any-product-id",
        name: createProjectDto.name,
        quantity: 10,
      };
      mockPrismaService.products.create.mockResolvedValue(mockProduct);

      await service.create(createProjectDto);

      expect(mockPrismaService.products.create).toHaveBeenCalledWith({
        data: createProjectDto,
      });
    });
  });

  describe("FindOne", () => {
    it("should find an existing product by id", async () => {
      const existingProduct = {
        id: "any-product-id",
        name: "existing user name",
        quantity: 30,
      };
      mockPrismaService.products.findUnique.mockResolvedValueOnce(
        existingProduct,
      );

      const foundProduct = await service.findOne(existingProduct.id);

      expect(foundProduct).toEqual(existingProduct);
      expect(mockPrismaService.products.findUnique).toHaveBeenCalledWith({
        where: { id: existingProduct.id },
      });
    });

    it("should return null if product with id does not exist", async () => {
      const nonExistingId = "non-existing-id";
      mockPrismaService.products.findUnique.mockResolvedValueOnce(null);

      const foundProduct = await service.findOne(nonExistingId);

      expect(foundProduct).toBeNull();
      expect(mockPrismaService.products.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistingId },
      });
    });
  });
});
