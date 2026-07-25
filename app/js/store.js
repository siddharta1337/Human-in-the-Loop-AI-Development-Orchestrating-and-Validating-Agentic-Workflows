// store.js - Vanilla ES6 Store utilizing localStorage and seeded from seed.json

const STORAGE_KEY = 'reimbursr_expenses';

export async function initializeStore() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    try {
      const response = await fetch('data/seed.json');
      if (!response.ok) {
        throw new Error('Failed to fetch seed.json');
      }
      const data = await response.json();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('Store initialized with seed data.');
    } catch (error) {
      console.error('Error initializing store with seed data, falling back to empty array:', error);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  }
}

export function getExpenses() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

export function saveExpenses(expenses) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    // Dispatch a custom event to notify other parts of the app if needed
    window.dispatchEvent(new CustomEvent('reimbursr-store-updated'));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

export function addExpense({ employeeName, category, amount, date, description }) {
  const expenses = getExpenses();
  const newExpense = {
    id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    employeeName: (employeeName || '').trim() || 'Anonymous',
    category: category || 'Other',
    amount: parseFloat(amount) || 0,
    date: date || new Date().toISOString().split('T')[0],
    description: (description || '').trim() || 'No description provided',
    status: 'Pending',
    submittedAt: new Date().toISOString(),
    notes: ''
  };
  expenses.unshift(newExpense); // Put newest first
  saveExpenses(expenses);
  return newExpense;
}

export function updateExpenseStatus(id, status, notes = '') {
  const expenses = getExpenses();
  const expenseIndex = expenses.findIndex(exp => exp.id === id);
  if (expenseIndex !== -1) {
    expenses[expenseIndex].status = status;
    expenses[expenseIndex].notes = notes.trim();
    saveExpenses(expenses);
    return expenses[expenseIndex];
  }
  return null;
}

export function getTotals() {
  const expenses = getExpenses();
  let approved = 0;
  let pending = 0;
  let rejected = 0;

  expenses.forEach(exp => {
    const val = parseFloat(exp.amount) || 0;
    if (exp.status === 'Approved') {
      approved += val;
    } else if (exp.status === 'Pending') {
      pending += val;
    } else if (exp.status === 'Rejected') {
      rejected += val;
    }
  });

  return {
    approved: parseFloat(approved.toFixed(2)),
    pending: parseFloat(pending.toFixed(2)),
    rejected: parseFloat(rejected.toFixed(2)),
    total: parseFloat((approved + pending + rejected).toFixed(2))
  };
}
