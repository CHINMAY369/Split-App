/**
 * Calculate optimal settlements to minimize number of transactions
 * Uses the concept of net balances and greedy algorithm
 */
exports.calculateOptimalSettlements = (people) => {
  const settlements = [];
  
  // Filter out people with zero balance (within 0.01 precision)
  const creditors = people.filter(p => p.balance > 0.01).sort((a, b) => b.balance - a.balance);
  const debtors = people.filter(p => p.balance < -0.01).sort((a, b) => a.balance - b.balance);
  
  // If no creditors or debtors, no settlements needed
  if (creditors.length === 0 || debtors.length === 0) {
    return settlements;
  }
  
  // Create working copies to avoid modifying original data
  const workingCreditors = creditors.map(c => ({ ...c }));
  const workingDebtors = debtors.map(d => ({ ...d, balance: Math.abs(d.balance) }));
  
  let i = 0, j = 0;
  
  while (i < workingCreditors.length && j < workingDebtors.length) {
    const creditor = workingCreditors[i];
    const debtor = workingDebtors[j];
    
    // Calculate settlement amount (minimum of what creditor is owed and debtor owes)
    const settlementAmount = Math.min(creditor.balance, debtor.balance);
    
    // Round to 2 decimal places to avoid floating point issues
    const roundedAmount = Math.round(settlementAmount * 100) / 100;
    
    if (roundedAmount > 0.01) {
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: roundedAmount
      });
    }
    
    // Update balances
    creditor.balance = Math.round((creditor.balance - settlementAmount) * 100) / 100;
    debtor.balance = Math.round((debtor.balance - settlementAmount) * 100) / 100;
    
    // Move to next creditor or debtor if current one is settled
    if (creditor.balance <= 0.01) {
      i++;
    }
    if (debtor.balance <= 0.01) {
      j++;
    }
  }
  
  return settlements;
};