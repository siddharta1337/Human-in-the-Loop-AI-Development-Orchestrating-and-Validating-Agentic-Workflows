// app.js - ES6 script for the Employee Portal
import { initializeStore, getExpenses, addExpense, getTotals } from './store.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize store (loads seed.json if localStorage is empty)
  await initializeStore();

  const expenseForm = document.getElementById('expense-form');
  const expenseDateInput = document.getElementById('expenseDate');
  const errorAlert = document.getElementById('validation-error-alert');
  const successAlert = document.getElementById('submission-success-alert');

  // Pre-fill today's date as default
  if (expenseDateInput) {
    const today = new Date().toISOString().split('T')[0];
    expenseDateInput.value = today;
  }

  function hideAlerts() {
    if (errorAlert) {
      errorAlert.style.display = 'none';
      errorAlert.innerHTML = '';
    }
    if (successAlert) {
      successAlert.style.display = 'none';
      successAlert.innerHTML = '';
    }
  }

  function showErrorMessages(errors) {
    if (!errorAlert) return;
    const items = errors.map(err => `<li>${escapeHTML(err)}</li>`).join('');
    errorAlert.innerHTML = `<strong>Submission Error:</strong><ul>${items}</ul>`;
    errorAlert.style.display = 'block';
  }

  function showSuccessMessage(msg) {
    if (!successAlert) return;
    successAlert.innerHTML = `<strong>Success!</strong> ${escapeHTML(msg)}`;
    successAlert.style.display = 'block';
    setTimeout(() => {
      successAlert.style.display = 'none';
    }, 4000);
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
          <td colspan="6" style="text-align: center; color: #888; padding: 20px;">
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

      const statusTooltip = exp.notes ? ` title="${escapeHTML(exp.notes)}"` : '';
      const rejectedReasonHtml = (exp.status === 'Rejected' && exp.notes)
        ? `<div style="font-size: 11px; color: #7b1313; margin-top: 4px; font-weight: normal; max-width: 140px; line-height: 1.3; word-break: break-word;"><strong>Reason:</strong> ${escapeHTML(exp.notes)}</div>`
        : '';

      return `
        <tr>
          <td style="white-space: nowrap;">${escapeHTML(exp.date)}</td>
          <td style="font-weight: bold;">${escapeHTML(exp.employeeName)}</td>
          <td><span class="expense-category-tag">${escapeHTML(exp.category)}</span></td>
          <td>${escapeHTML(exp.description)}</td>
          <td style="font-weight: bold; text-align: right;">$${formattedAmount}</td>
          <td>
            <span class="badge ${statusClass}"${statusTooltip}>${escapeHTML(exp.status)}</span>
            ${rejectedReasonHtml}
          </td>
        </tr>
      `;
    }).join('');
  }

  // Handle Form Submission
  if (expenseForm) {
    expenseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      hideAlerts();

      const employeeName = document.getElementById('employeeName').value;
      const category = document.getElementById('category').value;
      const date = document.getElementById('expenseDate').value;
      const amount = document.getElementById('amount').value;
      const description = document.getElementById('description').value;

      const result = addExpense({ employeeName, category, date, amount, description });

      if (!result.success) {
        showErrorMessages(result.errors);
        return;
      }

      showSuccessMessage('Your expense claim has been submitted successfully and is pending Finance review.');

      // Reset form and re-fill today's date
      expenseForm.reset();
      if (expenseDateInput) {
        const today = new Date().toISOString().split('T')[0];
        expenseDateInput.value = today;
      }

      // Re-render dashboard
      render();
    });
  }

  // Helper function to escape HTML special characters
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Synchronize across events & tabs
  window.addEventListener('reimbursr-store-updated', render);
  window.addEventListener('storage', (e) => {
    if (e.key === 'reimbursr_expenses') {
      render();
    }
  });

  // Initial render
  render();
});
