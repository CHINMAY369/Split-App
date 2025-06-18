const { body } = require('express-validator');

// Validate expense creation
exports.validateExpense = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number')
    .toFloat(),
  body('description')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Description is required and must be less than 200 characters'),
  body('paid_by')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Paid by field is required'),
  body('category')
    .optional()
    .isIn(['Food', 'Travel', 'Utilities', 'Entertainment', 'Other'])
    .withMessage('Category must be one of: Food, Travel, Utilities, Entertainment, Other'),
  body('participants')
    .optional()
    .isArray()
    .withMessage('Participants must be an array'),
  body('participants.*.name')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Participant name is required'),
  body('participants.*.share')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Participant share must be a positive number'),
  body('participants.*.shareType')
    .optional()
    .isIn(['equal', 'percentage', 'exact'])
    .withMessage('Share type must be equal, percentage, or exact')
];

// Validate expense update
exports.validateExpenseUpdate = [
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number')
    .toFloat(),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Description must be less than 200 characters'),
  body('paid_by')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Paid by field cannot be empty'),
  body('category')
    .optional()
    .isIn(['Food', 'Travel', 'Utilities', 'Entertainment', 'Other'])
    .withMessage('Category must be one of: Food, Travel, Utilities, Entertainment, Other')
];