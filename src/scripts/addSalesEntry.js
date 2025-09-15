// Sales Entry Script - Rice Sale Transaction
// This adds the sales entry for 2kg rice sale

const salesTransactions = [
  {
    transactionDate: new Date().toISOString().split('T')[0],
    description: 'Sale of 2kg Rice @ Tsh 3,500 per kg',
    lines: [
      {
        accountCode: '1010', // Cash in Hand
        debitAmount: 7000,   // 2kg * 3500 = 7000
        creditAmount: 0
      },
      {
        accountCode: '4010', // Sales Revenue
        debitAmount: 0,
        creditAmount: 7000   // 2kg * 3500 = 7000
      }
    ]
  },
  {
    transactionDate: new Date().toISOString().split('T')[0],
    description: 'Cost of Goods Sold - 2kg Rice @ Tsh 2,600 per kg',
    lines: [
      {
        accountCode: '5010', // Cost of Goods Sold
        debitAmount: 5200,   // 2kg * 2600 = 5200
        creditAmount: 0
      },
      {
        accountCode: '1040', // Inventory
        debitAmount: 0,
        creditAmount: 5200   // 2kg * 2600 = 5200
      }
    ]
  }
];

export { salesTransactions };