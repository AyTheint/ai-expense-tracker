import express from 'express';
import { createBudget, getBudgets, updateBudget, deleteBudget, analyzeBudgets } from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getBudgets);
router.post('/', createBudget);
router.post('/analyze', analyzeBudgets)
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;