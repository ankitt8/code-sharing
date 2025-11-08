// API Configuration
const API_BASE_URL = 'http://localhost:3000';

// DOM Elements
const transactionForm = document.getElementById('transactionForm');
const transactionsList = document.getElementById('transactionsList');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const refreshBtn = document.getElementById('refreshBtn');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const closeModal = document.querySelector('.close');
const cancelEdit = document.getElementById('cancelEdit');

// Summary elements
const totalCountEl = document.getElementById('totalCount');
const totalAmountEl = document.getElementById('totalAmount');
const avgAmountEl = document.getElementById('avgAmount');

// Global variables
let currentEditId = null;
let transactions = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    
    // Load transactions on page load
    loadTransactions();
    
    // Event listeners
    transactionForm.addEventListener('submit', handleAddTransaction);
    refreshBtn.addEventListener('submit', loadTransactions);
    editForm.addEventListener('submit', handleEditTransaction);
    closeModal.addEventListener('click', closeEditModal);
    cancelEdit.addEventListener('click', closeEditModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === editModal) {
            closeEditModal();
        }
    });
});

// Load all transactions from API
async function loadTransactions() {
    try {
        showLoading(true);
        hideError();
        
        const response = await fetch(`${API_BASE_URL}/transactions`);
        const data = await response.json();
        
        if (data.success) {
            transactions = data.data;
            displayTransactions(transactions);
            updateSummary(transactions);
        } else {
            throw new Error(data.message || 'Failed to load transactions');
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
        showError('Failed to load transactions. Make sure the server is running on port 3000.');
    } finally {
        showLoading(false);
    }
}

// Display transactions in the UI
function displayTransactions(transactions) {
    if (transactions.length === 0) {
        transactionsList.innerHTML = `
            <div class="empty-state">
                <h3>No transactions yet</h3>
                <p>Add your first transaction using the form above!</p>
            </div>
        `;
        return;
    }
    
    transactionsList.innerHTML = transactions.map(transaction => `
        <div class="transaction-item" data-id="${transaction._id}">
            <div class="transaction-info">
                <div class="transaction-name">${escapeHtml(transaction.name)}</div>
                <div class="transaction-date">${formatDate(transaction.date)}</div>
            </div>
            <div class="transaction-amount">₹${formatAmount(transaction.amount)}</div>
            <div class="transaction-actions">
                <button class="btn btn-edit" onclick="openEditModal('${transaction._id}')">
                    ✏️ Edit
                </button>
                <button class="btn btn-danger" onclick="deleteTransaction('${transaction._id}')">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Handle adding new transaction
async function handleAddTransaction(event) {
    event.preventDefault();
    
    const formData = new FormData(transactionForm);
    const transactionData = {
        name: formData.get('name').trim(),
        amount: parseFloat(formData.get('amount')),
        date: formData.get('date')
    };
    
    // Basic validation
    if (!transactionData.name || !transactionData.amount || !transactionData.date) {
        showError('Please fill in all fields');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Transaction added successfully!');
            transactionForm.reset();
            // Set today's date again
            document.getElementById('date').value = new Date().toISOString().split('T')[0];
            loadTransactions(); // Reload transactions
        } else {
            throw new Error(data.message || 'Failed to add transaction');
        }
    } catch (error) {
        console.error('Error adding transaction:', error);
        showError('Failed to add transaction: ' + error.message);
    }
}

// Open edit modal
function openEditModal(transactionId) {
    const transaction = transactions.find(t => t._id === transactionId);
    if (!transaction) return;
    
    currentEditId = transactionId;
    
    // Populate form
    document.getElementById('editName').value = transaction.name;
    document.getElementById('editAmount').value = transaction.amount;
    document.getElementById('editDate').value = transaction.date.split('T')[0];
    
    // Show modal
    editModal.style.display = 'block';
}

// Close edit modal
function closeEditModal() {
    editModal.style.display = 'none';
    currentEditId = null;
    editForm.reset();
}

// Handle editing transaction
async function handleEditTransaction(event) {
    event.preventDefault();
    
    if (!currentEditId) return;
    
    const formData = new FormData(editForm);
    const transactionData = {
        name: formData.get('name').trim(),
        amount: parseFloat(formData.get('amount')),
        date: formData.get('date')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/transactions/${currentEditId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Transaction updated successfully!');
            closeEditModal();
            loadTransactions(); // Reload transactions
        } else {
            throw new Error(data.message || 'Failed to update transaction');
        }
    } catch (error) {
        console.error('Error updating transaction:', error);
        showError('Failed to update transaction: ' + error.message);
    }
}

// Delete transaction
async function deleteTransaction(transactionId) {
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Transaction deleted successfully!');
            loadTransactions(); // Reload transactions
        } else {
            throw new Error(data.message || 'Failed to delete transaction');
        }
    } catch (error) {
        console.error('Error deleting transaction:', error);
        showError('Failed to delete transaction: ' + error.message);
    }
}

// Update summary statistics
function updateSummary(transactions) {
    const totalCount = transactions.length;
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;
    
    totalCountEl.textContent = totalCount;
    totalAmountEl.textContent = `₹${formatAmount(totalAmount)}`;
    avgAmountEl.textContent = `₹${formatAmount(avgAmount)}`;
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatAmount(amount) {
    return Math.abs(amount).toFixed(2);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    errorDiv.style.display = 'none';
}

function showSuccess(message) {
    // Remove existing success messages
    const existingSuccess = document.querySelector('.success');
    if (existingSuccess) {
        existingSuccess.remove();
    }
    
    // Create and show success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;
    
    // Insert after the form
    const addTransactionSection = document.querySelector('.add-transaction');
    addTransactionSection.appendChild(successDiv);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Refresh button click handler
refreshBtn.addEventListener('click', function(e) {
    e.preventDefault();
    loadTransactions();
});

// Add some keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Escape key closes modal
    if (event.key === 'Escape' && editModal.style.display === 'block') {
        closeEditModal();
    }
    
    // Ctrl/Cmd + R refreshes transactions
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        loadTransactions();
    }
});

// Auto-refresh every 30 seconds (optional)
setInterval(loadTransactions, 30000);
