import { ConflictException, Injectable } from "@nestjs/common";
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
    return `This action returns a #${id} product`;
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
    return `This action removes a #${id} product`;
  }
}
