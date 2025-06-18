const Person = require('../models/Person');
const Expense = require('../models/Expense');
const { calculateOptimalSettlements } = require('../utils/settlementCalculator');

// Get settlement summary
exports.getSettlements = async (req, res) => {
  try {
    const people = await Person.find();
    
    if (people.length === 0) {
      return res.json({
        success: true,
        data: {
          settlements: [],
          summary: 'No expenses recorded yet'
        },
        message: 'No settlements needed'
      });
    }

    const settlements = calculateOptimalSettlements(people);

    res.json({
      success: true,
      data: {
        settlements,
        totalTransactions: settlements.length,
        summary: settlements.length === 0 ? 
          'All balances are settled!' : 
          `${settlements.length} transaction(s) needed to settle all balances`
      },
      message: 'Settlement summary calculated successfully'
    });
  } catch (error) {
    console.error('Error calculating settlements:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating settlements',
      error: error.message
    });
  }
};

// Get all balances
exports.getBalances = async (req, res) => {
  try {
    const people = await Person.find().sort({ name: 1 });
    
    if (people.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No people found'
      });
    }

    const balances = people.map(person => ({
      name: person.name,
      totalPaid: Math.round(person.totalPaid * 100) / 100,
      totalOwed: Math.round(person.totalOwed * 100) / 100,
      balance: Math.round(person.balance * 100) / 100,
      status: person.balance > 0 ? 'owed' : person.balance < 0 ? 'owes' : 'settled'
    }));

    const summary = {
      totalPeople: people.length,
      totalAmount: Math.round(people.reduce((sum, p) => sum + p.totalPaid, 0) * 100) / 100,
      peopleWhoOwe: balances.filter(b => b.balance < 0).length,
      peopleOwed: balances.filter(b => b.balance > 0).length,
      peopleSettled: balances.filter(b => b.balance === 0).length
    };

    res.json({
      success: true,
      data: balances,
      summary,
      message: 'Balances retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching balances:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching balances',
      error: error.message
    });
  }
};