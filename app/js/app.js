// app.js - ES6 script for the Employee Portal
import { initializeStore, getExpenses, addExpense, getTotals } from './store.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initializeStore();

  const expenseForm = document.getElementById('expense-form');
  const expenseDateInput = document.getElementById('expenseDate');
  const errorAlert = document.getElementById('validation-error-alert');
  const successAlert = document.getElementById('submission-success-alert');

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

  function render() {
    const expenses = getExpenses();
    const totals = getTotals();

    const totalApprovedEl = document.getElementById('total-approved');
    const totalPendingEl = document.getElementById('total-pending');

    if (totalApprovedEl) {
      totalApprovedEl.textContent = totals.approved;
    }
    if (totalPendingEl) {
      totalPendingEl.textContent = totals.pending;
    }

    const tbody = document.getElementById('expense-list-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (expenses.length === 0) {
      const emptyTr = document.createElement('tr');
      emptyTr.innerHTML = '<td colspan="6" style="text-align: center; color: #888; padding: 20px;">No expenses found. Submit your first expense using the form!</td>';
      tbody.appendChild(emptyTr);
      return;
    }

    expenses.forEach(exp => {
      const tr = document.createElement('tr');

      const tdDate = document.createElement('td');
      tdDate.style.whiteSpace = 'nowrap';
      tdDate.textContent = exp.date;

      const tdEmp = document.createElement('td');
      tdEmp.style.fontWeight = 'bold';
      tdEmp.textContent = exp.employeeName;

      const tdCat = document.createElement('td');
      const catSpan = document.createElement('span');
      catSpan.className = 'expense-category-tag';
      catSpan.textContent = exp.category;
      tdCat.appendChild(catSpan);

      // CHANGE 4: Description rendered with textContent in employee view
      const tdDesc = document.createElement('td');
      tdDesc.textContent = exp.description;

      // CHANGE 1: Amount displayed exactly as stored
      const tdAmount = document.createElement('td');
      tdAmount.style.fontWeight = 'bold';
      tdAmount.style.textAlign = 'right';
      tdAmount.textContent = exp.amount;

      const tdStatus = document.createElement('td');
      let statusClass = 'badge-pending';
      if (exp.status === 'Approved') statusClass = 'badge-approved';
      if (exp.status === 'Rejected') statusClass = 'badge-rejected';

      const badgeSpan = document.createElement('span');
      badgeSpan.className = `badge ${statusClass}`;
      badgeSpan.textContent = exp.status;
      tdStatus.appendChild(badgeSpan);

      if (exp.status === 'Rejected' && exp.notes) {
        const reasonDiv = document.createElement('div');
        reasonDiv.style.fontSize = '11px';
        reasonDiv.style.color = '#7b1313';
        reasonDiv.style.marginTop = '4px';
        reasonDiv.textContent = 'Reason: ' + exp.notes;
        tdStatus.appendChild(reasonDiv);
      }

      tr.appendChild(tdDate);
      tr.appendChild(tdEmp);
      tr.appendChild(tdCat);
      tr.appendChild(tdDesc);
      tr.appendChild(tdAmount);
      tr.appendChild(tdStatus);

      tbody.appendChild(tr);
    });
  }

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

      expenseForm.reset();
      if (expenseDateInput) {
        const today = new Date().toISOString().split('T')[0];
        expenseDateInput.value = today;
      }

      render();
    });
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.addEventListener('reimbursr-store-updated', render);
  window.addEventListener('storage', (e) => {
    if (e.key === 'reimbursr_expenses') {
      render();
    }
  });

  render();
});
