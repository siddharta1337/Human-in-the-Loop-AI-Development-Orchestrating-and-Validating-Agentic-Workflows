// store.js - Vanilla ES6 Store utilizing localStorage and seeded from seed.json
import { validateExpenseSubmission, validateStatusUpdate } from './rules.js';

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
    // Dispatch custom event for cross-component update
    window.dispatchEvent(new CustomEvent('reimbursr-store-updated'));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

/**
 * Adds an expense after running full specification validation.
 * Edge case: A submission that fails validation creates no record at all.
 * Deduplication: Identical submissions produce no duplicate record.
 */
export function addExpense({ employeeName, category, amount, date, description }) {
  const expenses = getExpenses();

  const validation = validateExpenseSubmission(
    { employeeName, category, amount, date, description },
    expenses
  );

  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
      isDuplicate: validation.isDuplicate
    };
  }

  const newExpense = {
    id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    employeeName: validation.candidate.employeeName,
    category: validation.candidate.category,
    amount: validation.candidate.amount,
    date: validation.candidate.date,
    description: validation.candidate.description,
    status: 'Pending',
    submittedAt: new Date().toISOString(),
    notes: ''
  };

  expenses.unshift(newExpense); // Newest first
  saveExpenses(expenses);

  return {
    success: true,
    expense: newExpense
  };
}

/**
 * Updates status of an expense (Approved / Rejected) with validation.
 * Edge case: An expense that has already been decided cannot be decided a second time.
 * Expectation: Rejection requires notes/reason for the employee.
 */
export function updateExpenseStatus(id, newStatus, notes = '') {
  const expenses = getExpenses();
  const expenseIndex = expenses.findIndex(exp => exp.id === id);

  if (expenseIndex === -1) {
    return {
      success: false,
      errors: ['Expense claim not found.']
    };
  }

  const expense = expenses[expenseIndex];
  const validation = validateStatusUpdate(expense, newStatus, notes);

  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  expenses[expenseIndex].status = newStatus;
  expenses[expenseIndex].notes = (notes || '').trim();
  saveExpenses(expenses);

  return {
    success: true,
    expense: expenses[expenseIndex]
  };
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
