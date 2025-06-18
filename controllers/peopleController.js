const Person = require('../models/Person');
const Expense = require('../models/Expense');

// Get all people
exports.getAllPeople = async (req, res) => {
  try {
    const people = await Person.find().sort({ name: 1 });
    
    // If no people found, extract from expenses
    if (people.length === 0) {
      const expenses = await Expense.find();
      const uniqueNames = new Set();
      
      expenses.forEach(expense => {
        uniqueNames.add(expense.paid_by);
        expense.participants.forEach(p => uniqueNames.add(p.name));
      });

      const peopleFromExpenses = Array.from(uniqueNames).map(name => ({ name }));
      
      return res.json({
        success: true,
        data: peopleFromExpenses,
        count: peopleFromExpenses.length,
        message: 'People derived from expenses'
      });
    }

    res.json({
      success: true,
      data: people,
      count: people.length,
      message: 'People retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching people:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching people',
      error: error.message
    });
  }
};

// Get person by name
exports.getPersonByName = async (req, res) => {
  try {
    const { name } = req.params;
    const person = await Person.findOne({ name: name.trim() });

    if (!person) {
      return res.status(404).json({
        success: false,
        message: 'Person not found'
      });
    }

    // Get person's expenses
    const expensesPaid = await Expense.find({ paid_by: name });
    const expensesInvolved = await Expense.find({ 
      'participants.name': name 
    });

    res.json({
      success: true,
      data: {
        ...person.toObject(),
        expensesPaid: expensesPaid.length,
        expensesInvolved: expensesInvolved.length
      },
      message: 'Person details retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching person:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching person',
      error: error.message
    });
  }
};