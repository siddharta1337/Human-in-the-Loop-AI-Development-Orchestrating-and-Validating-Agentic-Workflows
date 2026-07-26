// rules.js - Domain logic & constraints validation according to docs/Spec.md

export const ALLOWED_CATEGORIES = ['Travel', 'Meals', 'Lodging', 'Supplies', 'Other'];

export function isFutureDate(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  return dateStr > todayStr;
}

export function isDuplicateExpense(candidate, existingExpenses = []) {
  const candEmp = (candidate.employeeName || '').trim().toLowerCase();
  const candCat = (candidate.category || '').trim();
  const candAmt = String(candidate.amount).trim();
  const candDate = (candidate.date || '').trim();
  const candDesc = (candidate.description || '').trim().toLowerCase();

  return existingExpenses.some(exp => {
    const expEmp = (exp.employeeName || '').trim().toLowerCase();
    const expCat = (exp.category || '').trim();
    const expAmt = String(exp.amount).trim();
    const expDate = (exp.date || '').trim();
    const expDesc = (exp.description || '').trim().toLowerCase();

    return (
      expEmp === candEmp &&
      expCat === candCat &&
      expAmt === candAmt &&
      expDate === candDate &&
      expDesc === candDesc
    );
  });
}

export function validateExpenseSubmission({ employeeName, category, amount, date, description }, existingExpenses = []) {
  const errors = [];

  const trimmedEmployee = (employeeName || '').trim();
  const trimmedCategory = (category || '').trim();
  const trimmedDate = (date || '').trim();
  const trimmedDesc = (description || '').trim();
  const rawAmount = amount !== undefined && amount !== null && amount !== '' ? String(amount).trim() : '';

  if (!trimmedEmployee) {
    errors.push('Employee Name is required.');
  }

  if (!trimmedCategory) {
    errors.push('Category is required.');
  } else if (!ALLOWED_CATEGORIES.includes(trimmedCategory)) {
    errors.push(`Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}.`);
  }

  if (!trimmedDate) {
    errors.push('Expense Date is required.');
  } else if (isFutureDate(trimmedDate)) {
    errors.push('Expense date cannot be in the future.');
  }

  if (!rawAmount) {
    errors.push('Amount is required.');
  } else {
    const numAmount = parseFloat(rawAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.push('Amount must be a positive number greater than 0.');
    }
  }

  if (!trimmedDesc) {
    errors.push('Description is required.');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      isDuplicate: false
    };
  }

  const candidate = {
    employeeName: trimmedEmployee,
    category: trimmedCategory,
    amount: rawAmount,
    date: trimmedDate,
    description: trimmedDesc
  };

  if (isDuplicateExpense(candidate, existingExpenses)) {
    return {
      isValid: false,
      errors: ['This identical expense has already been submitted.'],
      isDuplicate: true
    };
  }

  return {
    isValid: true,
    errors: [],
    candidate
  };
}

export function validateStatusUpdate(expense, newStatus, notes = '') {
  const errors = [];

  if (!expense) {
    errors.push('Expense record not found.');
    return { isValid: false, errors };
  }

  if (expense.status !== 'Pending') {
    errors.push(`An expense that has already been decided (${expense.status}) cannot be decided a second time.`);
  }

  if (newStatus === 'Rejected' && (!notes || !notes.trim())) {
    errors.push('A rejection reason must be provided when rejecting an expense submission.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
