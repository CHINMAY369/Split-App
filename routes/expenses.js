const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { validateExpense, validateExpenseUpdate } = require('../middleware/validation');

// GET /api/expenses - List all expenses
router.get('/', expenseController.getAllExpenses);

// POST /api/expenses - Add new expense
router.post('/', validateExpense, expenseController.createExpense);

// PUT /api/expenses/:id - Update expense
router.put('/:id', validateExpenseUpdate, expenseController.updateExpense);

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', expenseController.deleteExpense);

// GET /api/expenses/:id - Get single expense
router.get('/:id', expenseController.getExpenseById);

module.exports = router;