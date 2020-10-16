import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

class CreateTransactionService {
  private transactionsRepository: TransactionsRepository;

  constructor(transactionsRepository: TransactionsRepository) {
    this.transactionsRepository = transactionsRepository;
  }

  public execute({ id, title, type, value }: Transaction): Transaction {
    const { total } = this.transactionsRepository.getBalance();

    if ((type === 'outcome' && value) > total) {
      throw new Error('You do not have enough balance!');
    }

    return this.transactionsRepository.create({
      id,
      title,
      type,
      value,
    } as Transaction);
  }
}

export default CreateTransactionService;
