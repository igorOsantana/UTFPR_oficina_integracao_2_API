import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { AuthGuard } from "src/auth/auth.guard";

@UseGuards(AuthGuard)
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query("name") name: string) {
    return this.productsService.findAll(name);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.productsService.remove(id);
  }
}
