import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const findCustomer = await this.customersRepository.findById(customer_id);

    if (!findCustomer) {
      throw new AppError('Customer not find');
    }

    const findProducts = await this.productsRepository.findAllById(products);

    if (findProducts.length === 0) {
      throw new AppError('Products not found');
    }

    const findProductsIds = findProducts.map(product => product.id);

    const notExistProduts = products.filter(
      product => !findProductsIds.includes(product.id),
    );

    if (notExistProduts.length) {
      throw new AppError('Some product dont exist');
    }

    const findProductsWithNoQuantity = products.filter(
      product =>
        findProducts.filter(p => p.id === product.id)[0].quantity <
        product.quantity,
    );

    if (findProductsWithNoQuantity.length) {
      throw new AppError('Quantity not avalible');
    }

    const serializeProducts = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: findProducts.filter(p => p.id === product.id)[0].price,
    }));

    const order = await this.ordersRepository.create({
      customer: findCustomer,
      products: serializeProducts,
    });

    const orderedProductsQunatity = products.map(p => ({
      id: p.id,
      quantity:
        findProducts.filter(prod => prod.id === p.id)[0].quantity - p.quantity,
    }));
    await this.productsRepository.updateQuantity(orderedProductsQunatity);

    return order;
  }
}

export default CreateOrderService;
