const Expense = require('../models/Expense');
const Person = require('../models/Person');
const { validationResult } = require('express-validator');

// Get all expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: expenses,
      count: expenses.length,
      message: 'Expenses retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses',
      error: error.message
    });
  }
};

// Create new expense
exports.createExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { amount, description, paid_by, participants, category, isRecurring, recurringFrequency } = req.body;

    // Create expense
    const expense = new Expense({
      amount: parseFloat(amount),
      description,
      paid_by,
      participants: participants || [],
      category: category || 'Other',
      isRecurring: isRecurring || false,
      recurringFrequency
    });

    // If no participants provided, assume equal split among payer
    if (!participants || participants.length === 0) {
      expense.participants = [{
        name: paid_by,
        share: amount,
        shareType: 'exact'
      }];
    }

    await expense.save();

    // Update or create people
    await updatePeopleFromExpense(expense);

    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense added successfully'
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating expense',
      error: error.message
    });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updates = req.body;

    const expense = await Expense.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Update people after expense modification
    await recalculateAllPeople();

    res.json({
      success: true,
      data: expense,
      message: 'Expense updated successfully'
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating expense',
      error: error.message
    });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Recalculate people after deletion
    await recalculateAllPeople();

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting expense',
      error: error.message
    });
  }
};

// Get expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: expense,
      message: 'Expense retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense',
      error: error.message
    });
  }
};

// Helper function to update people from expense
async function updatePeopleFromExpense(expense) {
  const peopleNames = new Set([expense.paid_by]);
  expense.participants.forEach(p => peopleNames.add(p.name));

  for (const name of peopleNames) {
    await Person.findOneAndUpdate(
      { name },
      { name },
      { upsert: true, new: true }
    );
  }

  await recalculateAllPeople();
}

// Helper function to recalculate all people balances
async function recalculateAllPeople() {
  const expenses = await Expense.find();
  const people = await Person.find();

  // Reset all balances
  for (const person of people) {
    person.totalPaid = 0;
    person.totalOwed = 0;
    person.balance = 0;
  }

  // Calculate from expenses
  for (const expense of expenses) {
    const payer = people.find(p => p.name === expense.paid_by);
    if (payer) {
      payer.totalPaid += expense.amount;
    }

    // Calculate shares
    const totalParticipants = expense.participants.length || 1;
    const sharePerPerson = expense.amount / totalParticipants;

    expense.participants.forEach(participant => {
      const person = people.find(p => p.name === participant.name);
      if (person) {
        person.totalOwed += participant.shareType === 'exact' ? 
          participant.share : sharePerPerson;
      }
    });
  }

  // Calculate final balances
  for (const person of people) {
    person.balance = person.totalPaid - person.totalOwed;
    await person.save();
  }
}