import express from 'express';
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  getTransactionSummary,
  updateTransaction,
} from '../controllers/transactionController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyAdmin);

router.get('/', getTransactions);
router.get('/summary', getTransactionSummary);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
