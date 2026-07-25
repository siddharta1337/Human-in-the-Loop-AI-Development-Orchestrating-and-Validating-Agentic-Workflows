// app.js - ES6 script for the Employee Portal
import { initializeStore, getExpenses, addExpense, getTotals } from './store.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize store (loads seed.json if localStorage is empty)
  await initializeStore();

  const expenseForm = document.getElementById('expense-form');
  const expenseDateInput = document.getElementById('expenseDate');

  // Pre-fill today's date as default
  if (expenseDateInput) {
    const today = new Date().toISOString().split('T')[0];
    expenseDateInput.value = today;
  }

  // Render function
  function render() {
    const expenses = getExpenses();
    const totals = getTotals();

    // Render Totals
    const totalApprovedEl = document.getElementById('total-approved');
    const totalPendingEl = document.getElementById('total-pending');

    if (totalApprovedEl) {
      totalApprovedEl.textContent = `$${totals.approved.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (totalPendingEl) {
      totalPendingEl.textContent = `$${totals.pending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Render Table
    const tbody = document.getElementById('expense-list-body');
    if (!tbody) return;

    if (expenses.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: #888; padding: 20px;">
            No expenses found. Submit your first expense using the form!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = expenses.map(exp => {
      let statusClass = 'badge-pending';
      if (exp.status === 'Approved') statusClass = 'badge-approved';
      if (exp.status === 'Rejected') statusClass = 'badge-rejected';

      const formattedAmount = typeof exp.amount === 'number' 
        ? exp.amount.toFixed(2) 
        : parseFloat(exp.amount || 0).toFixed(2);

      return `
        <tr>
          <td style="white-space: nowrap;">${exp.date}</td>
          <td style="font-weight: bold;">${escapeHTML(exp.employeeName)}</td>
          <td><span class="expense-category-tag">${escapeHTML(exp.category)}</span></td>
          <td>${escapeHTML(exp.description)}</td>
          <td style="font-weight: bold; text-align: right;">$${formattedAmount}</td>
          <td><span class="badge ${statusClass}">${exp.status}</span></td>
          <td style="font-style: italic; color: #666;">${escapeHTML(exp.notes || '—')}</td>
        </tr>
      `;
    }).join('');
  }

  // Handle Form Submission
  if (expenseForm) {
    expenseForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const employeeName = document.getElementById('employeeName').value;
      const category = document.getElementById('category').value;
      const date = document.getElementById('expenseDate').value;
      const amount = document.getElementById('amount').value;
      const description = document.getElementById('description').value;

      addExpense({ employeeName, category, amount, date, description });

      // Reset form and re-fill today's date
      expenseForm.reset();
      if (expenseDateInput) {
        const today = new Date().toISOString().split('T')[0];
        expenseDateInput.value = today;
      }

      // Re-render
      render();
    });
  }

  // Escape HTML helper to prevent XSS
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Listen to custom store update events (for cross-tab synchronization or state update)
  window.addEventListener('reimbursr-store-updated', render);
  // Also synchronize across multiple windows/tabs via storage event
  window.addEventListener('storage', (e) => {
    if (e.key === 'reimbursr_expenses') {
      render();
    }
  });

  // Initial render
  render();
});
