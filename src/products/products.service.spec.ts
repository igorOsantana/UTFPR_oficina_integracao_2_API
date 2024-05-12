import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../database/prisma/prisma.service";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { Products } from "@prisma/client";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";

const mockPrismaService = {
  products: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
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

    it("should create and return a new product", async () => {
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
        name: "existing product name",
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

    it("should return the found product", async () => {
      const mockProduct: Products = {
        id: "any-product-id",
        name: "any product name",
        quantity: 10,
      };
      mockPrismaService.products.findUnique.mockResolvedValue(mockProduct);

      const response = await service.findOne(mockProduct.id);

      expect(response).toEqual(mockProduct);
      expect(mockPrismaService.products.findUnique).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
      });
    });
  });

  describe("FindOneByName", () => {
    it("should find an existing product by name", async () => {
      const existingProduct = {
        id: "any-product-id",
        name: "existing product name",
        quantity: 50,
      };
      mockPrismaService.products.findUnique.mockResolvedValueOnce(
        existingProduct,
      );

      const foundProduct = await service.findOneByName(existingProduct.name);

      expect(foundProduct).toEqual(existingProduct);
      expect(mockPrismaService.products.findUnique).toHaveBeenCalledWith({
        where: { name: existingProduct.name },
      });
    });

    it("should return null if product with name does not exist", async () => {
      const nonExistingName = "non-existing-name";
      mockPrismaService.products.findUnique.mockResolvedValueOnce(null);

      const foundProduct = await service.findOneByName(nonExistingName);

      expect(foundProduct).toBeNull();
      expect(mockPrismaService.products.findUnique).toHaveBeenCalledWith({
        where: { name: nonExistingName },
      });
    });

    it("should return the found product", async () => {
      const mockProduct: Products = {
        id: "any-product-id",
        name: "any product name",
        quantity: 20,
      };
      mockPrismaService.products.findUnique.mockResolvedValue(mockProduct);

      const response = await service.findOneByName(mockProduct.name);

      expect(response).toEqual(mockProduct);
      expect(mockPrismaService.products.findUnique).toHaveBeenCalledWith({
        where: { name: mockProduct.name },
      });
    });
  });

  describe("Remove", () => {
    it("should throw a not found exception if the product was not found", async () => {
      mockPrismaService.products.findUnique.mockResolvedValueOnce(null);
      const nonExistingId = "nonExistingId";

      const promise = service.remove(nonExistingId);

      await expect(promise).rejects.toThrow(
        new NotFoundException("Product was not found"),
      );
      expect(mockPrismaService.products.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistingId },
      });
      expect(mockPrismaService.products.delete).not.toHaveBeenCalled();
    });

    it("should return undefined if product was removed", async () => {
      const existingProduct = {
        id: "any-product-id",
        name: "any product name",
        quantity: 10,
      };
      mockPrismaService.products.findUnique.mockResolvedValueOnce(
        existingProduct,
      );

      const response = await service.remove(existingProduct.id);

      expect(response).toBeUndefined();
      expect(mockPrismaService.products.delete).toHaveBeenCalledWith({
        where: { id: existingProduct.id },
      });
    });
  });
});
