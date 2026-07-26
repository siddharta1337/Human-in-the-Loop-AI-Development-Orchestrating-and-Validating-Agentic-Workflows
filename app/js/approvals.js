// approvals.js - ES6 script for the Finance Review Portal
import { initializeStore, getExpenses, updateExpenseStatus, getTotals } from './store.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initializeStore();

  let activeFilter = 'all';
  let sortAmountAsc = null;

  const dialogOverlay = document.getElementById('rejection-dialog');
  const rejectNotesInput = document.getElementById('reject-notes');
  const rejectExpenseIdInput = document.getElementById('reject-expense-id');
  const rejectionErrorAlert = document.getElementById('rejection-error-alert');

  const filterAllBtn = document.getElementById('filter-all');
  const filterPendingBtn = document.getElementById('filter-pending');
  const filterApprovedBtn = document.getElementById('filter-approved');
  const filterRejectedBtn = document.getElementById('filter-rejected');
  const thAmount = document.getElementById('th-amount');

  const filterBtns = [
    { el: filterAllBtn, val: 'all' },
    { el: filterPendingBtn, val: 'Pending' },
    { el: filterApprovedBtn, val: 'Approved' },
    { el: filterRejectedBtn, val: 'Rejected' }
  ];

  filterBtns.forEach(btnInfo => {
    if (btnInfo.el) {
      btnInfo.el.addEventListener('click', () => {
        filterBtns.forEach(b => b.el.classList.remove('active'));
        btnInfo.el.classList.add('active');
        activeFilter = btnInfo.val;
        render();
      });
    }
  });

  // CHANGE 3: Clickable amount header sorting stored values directly without numeric conversion
  if (thAmount) {
    thAmount.addEventListener('click', () => {
      if (sortAmountAsc === null || sortAmountAsc === false) {
        sortAmountAsc = true;
      } else {
        sortAmountAsc = false;
      }
      render();
    });
  }

  function render() {
    const expenses = getExpenses();
    const totals = getTotals();

    const filteredExpenses = expenses.filter(exp => {
      if (activeFilter === 'all') return true;
      return exp.status === activeFilter;
    });

    // CHANGE 3: Sort comparing stored string values directly with no numeric conversion
    if (sortAmountAsc !== null) {
      filteredExpenses.sort((a, b) => {
        const valA = String(a.amount);
        const valB = String(b.amount);
        if (valA < valB) return sortAmountAsc ? -1 : 1;
        if (valA > valB) return sortAmountAsc ? 1 : -1;
        return 0;
      });
    }

    // CHANGE 2: Summed with parseFloat, printed with no formatting at all (raw JS number)
    let queueSum = 0;
    filteredExpenses.forEach(exp => {
      queueSum += parseFloat(exp.amount);
    });

    const totalApprovedEl = document.getElementById('total-approved');
    const totalPendingEl = document.getElementById('total-pending');
    const totalQueueEl = document.getElementById('total-queue');

    if (totalApprovedEl) {
      totalApprovedEl.textContent = totals.approved;
    }
    if (totalPendingEl) {
      totalPendingEl.textContent = totals.pending;
    }
    if (totalQueueEl) {
      totalQueueEl.textContent = queueSum;
    }

    const tbody = document.getElementById('approvals-list-body');
    if (!tbody) return;

    if (filteredExpenses.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: #888; padding: 20px;">
            No claims found matching the filter "${escapeHTML(activeFilter)}".
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filteredExpenses.map(exp => {
      let statusClass = 'badge-pending';
      if (exp.status === 'Approved') statusClass = 'badge-approved';
      if (exp.status === 'Rejected') statusClass = 'badge-rejected';

      let actionCell = '';
      if (exp.status === 'Pending') {
        actionCell = `
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-success btn-small btn-approve" data-id="${exp.id}">Approve</button>
            <button class="btn btn-danger btn-small btn-reject" data-id="${exp.id}">Reject</button>
          </div>
        `;
      } else {
        actionCell = `<span style="font-style: italic; color: #666;">${escapeHTML(exp.notes || '—')}</span>`;
      }

      // CHANGE 4: Render description with innerHTML, unescaped and unsanitized in Finance queue
      // CHANGE 1: Render amount exactly as stored
      return `
        <tr>
          <td style="white-space: nowrap;">${escapeHTML(exp.date)}</td>
          <td style="font-weight: bold;">${escapeHTML(exp.employeeName)}</td>
          <td><span class="expense-category-tag">${escapeHTML(exp.category)}</span></td>
          <td>${exp.description}</td>
          <td style="font-weight: bold; text-align: right;">${exp.amount}</td>
          <td><span class="badge ${statusClass}">${escapeHTML(exp.status)}</span></td>
          <td>${actionCell}</td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.btn-approve').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const result = updateExpenseStatus(id, 'Approved', 'Approved by Finance');
        if (!result.success) {
          alert(`Error approving expense: ${result.errors.join(', ')}`);
        }
        render();
      });
    });

    document.querySelectorAll('.btn-reject').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        openRejectionDialog(id);
      });
    });
  }

  function openRejectionDialog(id) {
    rejectExpenseIdInput.value = id;
    rejectNotesInput.value = '';
    if (rejectionErrorAlert) {
      rejectionErrorAlert.style.display = 'none';
      rejectionErrorAlert.innerHTML = '';
    }
    dialogOverlay.classList.add('active');
    rejectNotesInput.focus();
  }

  function closeRejectionDialog() {
    dialogOverlay.classList.remove('active');
    if (rejectionErrorAlert) {
      rejectionErrorAlert.style.display = 'none';
      rejectionErrorAlert.innerHTML = '';
    }
  }

  const cancelRejectBtn = document.getElementById('btn-cancel-reject');
  const confirmRejectBtn = document.getElementById('btn-confirm-reject');

  if (cancelRejectBtn) {
    cancelRejectBtn.addEventListener('click', closeRejectionDialog);
  }

  if (confirmRejectBtn) {
    confirmRejectBtn.addEventListener('click', () => {
      const id = rejectExpenseIdInput.value;
      const notes = rejectNotesInput.value;

      const result = updateExpenseStatus(id, 'Rejected', notes);

      if (!result.success) {
        if (rejectionErrorAlert) {
          rejectionErrorAlert.innerHTML = `<strong>Error:</strong> ${result.errors.map(err => escapeHTML(err)).join('<br>')}`;
          rejectionErrorAlert.style.display = 'block';
        } else {
          alert(`Rejection error: ${result.errors.join(', ')}`);
        }
        return;
      }

      closeRejectionDialog();
      render();
    });
  }

  if (dialogOverlay) {
    dialogOverlay.addEventListener('click', (e) => {
      if (e.target === dialogOverlay) {
        closeRejectionDialog();
      }
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
