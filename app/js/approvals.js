// approvals.js - ES6 script for the Finance Review Portal
import { initializeStore, getExpenses, updateExpenseStatus, getTotals } from './store.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize store (loads seed.json if localStorage is empty)
  await initializeStore();

  let activeFilter = 'all'; // can be: all, Pending, Approved, Rejected

  const dialogOverlay = document.getElementById('rejection-dialog');
  const rejectNotesInput = document.getElementById('reject-notes');
  const rejectExpenseIdInput = document.getElementById('reject-expense-id');
  const rejectionErrorAlert = document.getElementById('rejection-error-alert');

  // Filter Buttons
  const filterAllBtn = document.getElementById('filter-all');
  const filterPendingBtn = document.getElementById('filter-pending');
  const filterApprovedBtn = document.getElementById('filter-approved');
  const filterRejectedBtn = document.getElementById('filter-rejected');

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

    // Filter expenses
    const filteredExpenses = expenses.filter(exp => {
      if (activeFilter === 'all') return true;
      return exp.status === activeFilter;
    });

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

      const formattedAmount = typeof exp.amount === 'number'
        ? exp.amount.toFixed(2)
        : parseFloat(exp.amount || 0).toFixed(2);

      let actionCell = '';
      // Edge Case: An expense that has already been decided cannot be decided a second time.
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

      return `
        <tr>
          <td style="white-space: nowrap;">${escapeHTML(exp.date)}</td>
          <td style="font-weight: bold;">${escapeHTML(exp.employeeName)}</td>
          <td><span class="expense-category-tag">${escapeHTML(exp.category)}</span></td>
          <td>${escapeHTML(exp.description)}</td>
          <td style="font-weight: bold; text-align: right;">$${formattedAmount}</td>
          <td><span class="badge ${statusClass}">${escapeHTML(exp.status)}</span></td>
          <td>${actionCell}</td>
        </tr>
      `;
    }).join('');

    // Attach Approve button events
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

    // Attach Reject button events
    document.querySelectorAll('.btn-reject').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        openRejectionDialog(id);
      });
    });
  }

  // Dialog management
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

  // Dialog handlers
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

  // Close dialog on overlay click
  if (dialogOverlay) {
    dialogOverlay.addEventListener('click', (e) => {
      if (e.target === dialogOverlay) {
        closeRejectionDialog();
      }
    });
  }

  // Escape HTML helper
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Listen to custom store update events & multi-tab storage updates
  window.addEventListener('reimbursr-store-updated', render);
  window.addEventListener('storage', (e) => {
    if (e.key === 'reimbursr_expenses') {
      render();
    }
  });

  // Initial render
  render();
});
