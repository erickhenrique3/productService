import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../categories/category.entity';
import { CreateProductDto } from './dtoProduct/create-product.dto';
import { UpdateProductDto } from './dtoProduct/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private repo: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async create(data: CreateProductDto) {
    const category = await this.categoryRepo.findOne({ where: { id: data.categoryId } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const product = this.repo.create(data);
    return await this.repo.save(product);
  }

  findAll() {
    return this.repo.find({ relations: ['category'] });
  }

  async findOne(id: number) {
    const product = await this.repo.findOne({ where: { id }, relations: ['category'] });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: number, data: UpdateProductDto) {
    await this.findOne(id);
    if (data.categoryId) {
      const category = await this.categoryRepo.findOne({ where: { id: data.categoryId } });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.repo.delete(id);
  }

  async decreaseStock(productId: number, quantity: number) {
    const product = await this.repo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Produto ${productId} não encontrado`);
  
    if (product.stock < quantity) {
      throw new BadRequestException(`Estoque insuficiente para o produto ${product.name}`);
    }
  
    product.stock -= quantity;
    await this.repo.save(product);
  
    console.log(`✅ Estoque atualizado para o produto ${productId}: -${quantity}`);
  }
}
