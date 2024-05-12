import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { PrismaService } from "../database/prisma/prisma.service";

@Injectable()
export class ProductsService {
  constructor(private readonly dbService: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const existingProduct = await this.findOneByName(createProductDto.name);
    if (existingProduct) {
      throw new ConflictException("Name already in use");
    }
    return await this.dbService.products.create({ data: createProductDto });
  }

  async findOne(id: string) {
    const product = await this.dbService.products.findUnique({
      where: { id },
    });
    if (!product) {
      return null;
    }
    return product;
  }

  async findOneByName(name: string) {
    const product = await this.dbService.products.findUnique({
      where: { name },
    });
    if (!product) {
      return null;
    }
    return product;
  }

  async remove(id: string) {
    const exists = await this.findOne(id);
    if (!exists) {
      throw new NotFoundException("Product was not found");
    }
    await this.dbService.products.delete({ where: { id } });
  }
}
