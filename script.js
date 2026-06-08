/**
 * ============================================
 * M3S - MESS MEAL MANAGEMENT SYSTEM
 * JAVASCRIPT APPLICATION LOGIC
 * ============================================
 * 
 * This file contains all the state management,
 * calculations, and event handlers for the M3S system.
 * 
 * CHANGE HERE FOR: Backend API Integration
 * Replace mock data with actual API calls:
 *   - GET /api/auth/me - Get current user
 *   - GET /api/members - List all members
 *   - POST /api/deposits - Add deposit
 *   - GET /api/meals - Get meal records
 *   - POST /api/meals - Record meals
 *   - GET /api/expenses - Get all expenses
 *   - POST /api/expenses - Add expense
 */

// ============================================
// APPLICATION STATE OBJECT
// ============================================
/**
 * Centralized state object holding all application data.
 * In production, this would be synced with a backend database.
 */
const AppState = {
    // Current authenticated user
    currentUser: null,

    // Members array - stores all mess members
    members: [
        {
            id: 1,
            name: 'Alice Johnson',
            room: '101A',
            mobile: '+1-555-0101',
            email: 'alice@example.com',
            githubUsername: 'alice-dev',
            status: 'active'
        },
        {
            id: 2,
            name: 'Bob Smith',
            room: '102B',
            mobile: '+1-555-0102',
            email: 'bob@example.com',
            githubUsername: 'bob-smith',
            status: 'active'
        },
        {
            id: 3,
            name: 'Carol Davis',
            room: '103C',
            mobile: '+1-555-0103',
            email: 'carol@example.com',
            githubUsername: 'carol-dev',
            status: 'active'
        }
    ],

    // Deposits array - stores all member deposits
    // CHANGE HERE FOR: Load from /api/deposits
    deposits: [
        { id: 1, memberId: 1, amount: 50, date: '2024-01-15' },
        { id: 2, memberId: 1, amount: 30, date: '2024-01-20' },
        { id: 3, memberId: 2, amount: 100, date: '2024-01-18' },
        { id: 4, memberId: 3, amount: 75, date: '2024-01-19' }
    ],

    // Meals array - stores daily meal records
    // CHANGE HERE FOR: Load from /api/meals
    meals: [
        { id: 1, memberId: 1, breakfast: 1, lunch: 1, dinner: 1, date: '2024-01-20' },
        { id: 2, memberId: 1, breakfast: 0, lunch: 1, dinner: 1, date: '2024-01-21' },
        { id: 3, memberId: 2, breakfast: 1, lunch: 1, dinner: 1, date: '2024-01-20' },
        { id: 4, memberId: 2, breakfast: 1, lunch: 1, dinner: 0, date: '2024-01-21' },
        { id: 5, memberId: 3, breakfast: 1, lunch: 1, dinner: 1, date: '2024-01-20' }
    ],

    // Expenses array - stores mess expenses
    // CHANGE HERE FOR: Load from /api/expenses
    expenses: [
        { id: 1, category: 'groceries', amount: 45.50, date: '2024-01-15', description: 'Vegetables & Rice' },
        { id: 2, category: 'dairy', amount: 12.00, date: '2024-01-16', description: 'Milk & Cheese' },
        { id: 3, category: 'spices', amount: 8.75, date: '2024-01-17', description: 'Spices Mix' },
        { id: 4, category: 'utilities', amount: 25.00, date: '2024-01-18', description: 'Gas & Electricity' }
    ]
};

// ============================================
// INITIALIZATION
// ============================================
/**
 * Initialize the application on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date in form inputs
    document.getElementById('meal-date').valueAsDate = new Date();
    document.getElementById('expense-date').valueAsDate = new Date();

    // Initialize UI
    renderMemberDirectory();
    populateMemberSelects();
    updateFinancialAnalytics();
    renderExpensesList();

    // CHANGE HERE FOR: Initialize WebSocket or polling for real-time updates
    // Example: Connect to /ws/updates for live data sync from Google Sheets
});

// ============================================
// AUTHENTICATION HANDLERS
// ============================================

/**
 * Switch between Login and Register tabs
 * @param {string} tabName - 'login' or 'register'
 */
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update form visibility
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.add('hidden');
    });
    document.getElementById(`${tabName}-form`).classList.remove('hidden');
}

/**
 * Handle login form submission
 * CHANGE HERE FOR: Send credentials to /api/auth/login
 * Expected POST payload: { email, password }
 * Expected response: { token, user: { id, name, room, email } }
 */
function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    // CHANGE HERE FOR: Replace mock auth with actual API call
    /*
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.token) {
        localStorage.setItem('authToken', data.token);
        AppState.currentUser = data.user;
        showDashboard();
    } else {
        alert('Login failed: ' + (data.message || 'Unknown error'));
    }
    */

    // Mock authentication for demonstration
    AppState.currentUser = {
        id: 1,
        name: 'Alice Johnson',
        email: email,
        room: '101A',
        githubUsername: 'alice-dev'
    };

    showDashboard();
}

/**
 * Handle registration form submission
 * CHANGE HERE FOR: Send user data to /api/auth/register
 * Expected POST payload: { name, email, password, githubUsername, mobile, room }
 * Expected response: { token, user: { id, name, room, email } }
 */
function handleRegister() {
    const name = document.getElementById('register-name').value;
    const github = document.getElementById('register-github').value;
    const email = document.getElementById('register-email').value;
    const mobile = document.getElementById('register-mobile').value;
    const room = document.getElementById('register-room').value;
    const password = document.getElementById('register-password').value;

    if (!name || !github || !email || !mobile || !room || !password) {
        alert('Please fill in all fields');
        return;
    }

    // CHANGE HERE FOR: Replace mock registration with actual API call
    /*
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, githubUsername: github, mobile, room })
    });
    const data = await response.json();
    if (data.token) {
        localStorage.setItem('authToken', data.token);
        AppState.currentUser = data.user;
        showDashboard();
    } else {
        alert('Registration failed: ' + (data.message || 'Unknown error'));
    }
    */

    // Mock registration for demonstration
    AppState.currentUser = {
        id: Date.now(),
        name: name,
        email: email,
        room: room,
        githubUsername: github
    };

    // Add new member to the members array
    AppState.members.push({
        id: AppState.currentUser.id,
        name: name,
        room: room,
        mobile: mobile,
        email: email,
        githubUsername: github,
        status: 'active'
    });

    showDashboard();
}

/**
 * Initiate GitHub OAuth flow
 * CHANGE HERE FOR: Redirect to GitHub OAuth endpoint
 * Expected: Redirects to GitHub OAuth, then back to /api/auth/github/callback
 * @param {string} mode - 'login' or 'register'
 */
function initiateGitHubOAuth(mode = 'login') {
    // CHANGE HERE FOR: Replace with actual GitHub OAuth URL
    /*
    const clientId = 'YOUR_GITHUB_CLIENT_ID';
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/github/callback`);
    const scope = 'user:email';
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${mode}`;
    window.location.href = authUrl;
    */

    // Mock OAuth for demonstration
    AppState.currentUser = {
        id: Date.now(),
        name: 'GitHub User',
        email: 'user@github.com',
        room: 'TBD',
        githubUsername: 'github-user'
    };

    showDashboard();
}

/**
 * Handle logout
 * CHANGE HERE FOR: Send logout request to /api/auth/logout
 * Expected POST payload: { token }
 * Clears session and returns to login
 */
function handleLogout() {
    // CHANGE HERE FOR: Call logout API endpoint
    /*
    await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    });
    */

    localStorage.removeItem('authToken');
    AppState.currentUser = null;
    showAuthPage();
}

// ============================================
// UI STATE MANAGEMENT
// ============================================

/**
 * Show authentication page and hide dashboard
 */
function showAuthPage() {
    document.getElementById('auth-page').classList.remove('hidden');
    document.getElementById('dashboard-page').classList.add('hidden');
    
    // Reset forms
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-name').value = '';
    document.getElementById('register-github').value = '';
    document.getElementById('register-email').value = '';
    document.getElementById('register-mobile').value = '';
    document.getElementById('register-room').value = '';
    document.getElementById('register-password').value = '';
}

/**
 * Show dashboard and hide authentication page
 */
function showDashboard() {
    document.getElementById('auth-page').classList.add('hidden');
    document.getElementById('dashboard-page').classList.remove('hidden');

    // Update user info in header
    if (AppState.currentUser) {
        document.getElementById('user-name').textContent = AppState.currentUser.name;
        document.getElementById('user-room').textContent = `Room ${AppState.currentUser.room}`;
        
        // Set avatar initials
        const initials = AppState.currentUser.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        document.getElementById('user-avatar-icon').textContent = initials;
    }

    // Refresh all data
    renderMemberDirectory();
    populateMemberSelects();
    updateFinancialAnalytics();
}

// ============================================
// MODULE 1: MEMBER DIRECTORY
// ============================================

/**
 * Render the member directory table
 * CHANGE HERE FOR: Load from /api/members API
 * Expected: GET /api/members returns array of members
 */
function renderMemberDirectory() {
    const tbody = document.getElementById('member-directory-table');
    
    if (AppState.members.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <h4>No members yet</h4>
                    <p>Add members to get started</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = AppState.members.map(member => `
        <tr>
            <td><strong>${member.name}</strong></td>
            <td>${member.room}</td>
            <td>
                <div style="font-size: 12px;">
                    ${member.email}<br>
                    ${member.mobile}
                </div>
            </td>
            <td>
                <span class="status-badge ${member.status}">
                    ${member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </span>
            </td>
        </tr>
    `).join('');
}

// ============================================
// MODULE 2: DEPOSIT LEDGER
// ============================================

/**
 * Populate member select dropdowns throughout the app
 */
function populateMemberSelects() {
    const selects = [
        'deposit-member-select',
        'meal-member-select'
    ];

    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Choose member...</option>' + 
                AppState.members.map(member => 
                    `<option value="${member.id}">${member.name}</option>`
                ).join('');
            select.value = currentValue;
        }
    });
}

/**
 * Add a new deposit for a member
 * CHANGE HERE FOR: Send deposit data to /api/deposits
 * Expected POST payload: { memberId, amount, date }
 * Expected response: { id, memberId, amount, date }
 */
function addDeposit() {
    const memberId = parseInt(document.getElementById('deposit-member-select').value);
    const amount = parseFloat(document.getElementById('deposit-amount').value);

    if (!memberId || !amount || amount <= 0) {
        alert('Please select a member and enter a valid amount');
        return;
    }

    // CHANGE HERE FOR: Send to backend API
    /*
    const response = await fetch('/api/deposits', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ memberId, amount, date: new Date().toISOString().split('T')[0] })
    });
    const deposit = await response.json();
    AppState.deposits.push(deposit);
    */

    // Mock API call
    const deposit = {
        id: Date.now(),
        memberId: memberId,
        amount: amount,
        date: new Date().toISOString().split('T')[0]
    };
    AppState.deposits.push(deposit);

    // Clear inputs
    document.getElementById('deposit-amount').value = '';

    // Update display
    renderDepositsList(memberId);
    updateFinancialAnalytics();
}

/**
 * Render deposits list for a selected member
 * @param {number} memberId - ID of the member to display deposits for
 */
function renderDepositsList(memberId) {
    const list = document.getElementById('deposits-list');
    const memberDeposits = AppState.deposits.filter(d => d.memberId === memberId);

    if (memberDeposits.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💵</div>
                <h4>No deposits recorded</h4>
                <p>Add a deposit to get started</p>
            </div>
        `;
        document.getElementById('total-deposit').textContent = '$0.00';
        return;
    }

    // Calculate total
    const total = memberDeposits.reduce((sum, d) => sum + d.amount, 0);

    list.innerHTML = memberDeposits
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(deposit => `
            <div class="deposit-item">
                <div class="deposit-item-left">
                    <span class="deposit-date">${new Date(deposit.date).toLocaleDateString()}</span>
                    <span class="deposit-amount">$${deposit.amount.toFixed(2)}</span>
                </div>
            </div>
        `).join('');

    document.getElementById('total-deposit').textContent = `$${total.toFixed(2)}`;
}

/**
 * Handle member selection in deposit module
 */
document.addEventListener('change', function(e) {
    if (e.target.id === 'deposit-member-select') {
        const memberId = parseInt(e.target.value);
        if (memberId) {
            renderDepositsList(memberId);
            updateFinancialAnalytics();
        }
    }
    if (e.target.id === 'meal-member-select') {
        const memberId = parseInt(e.target.value);
        if (memberId) {
            renderMealsList(memberId);
            updateFinancialAnalytics();
        }
    }
});

// ============================================
// MODULE 3: DAILY MEAL TRACKER
// ============================================

/**
 * Record meal counts for a member
 * CHANGE HERE FOR: Send meal data to /api/meals
 * Expected POST payload: { memberId, breakfast, lunch, dinner, date }
 * Expected response: { id, memberId, breakfast, lunch, dinner, date }
 */
function recordMeal() {
    const memberId = parseInt(document.getElementById('meal-member-select').value);
    const date = document.getElementById('meal-date').value;
    const breakfast = parseInt(document.getElementById('meal-breakfast').value) || 0;
    const lunch = parseInt(document.getElementById('meal-lunch').value) || 0;
    const dinner = parseInt(document.getElementById('meal-dinner').value) || 0;

    if (!memberId || !date) {
        alert('Please select a member and date');
        return;
    }

    // CHANGE HERE FOR: Send to backend API
    /*
    const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ memberId, breakfast, lunch, dinner, date })
    });
    const meal = await response.json();
    AppState.meals.push(meal);
    */

    // Mock API call
    const meal = {
        id: Date.now(),
        memberId: memberId,
        breakfast: breakfast,
        lunch: lunch,
        dinner: dinner,
        date: date
    };
    AppState.meals.push(meal);

    // Reset inputs
    document.getElementById('meal-breakfast').value = 0;
    document.getElementById('meal-lunch').value = 0;
    document.getElementById('meal-dinner').value = 0;
    document.getElementById('meal-date').valueAsDate = new Date();

    // Update display
    renderMealsList(memberId);
    updateFinancialAnalytics();
}

/**
 * Render meals list for a selected member
 * @param {number} memberId - ID of the member to display meals for
 */
function renderMealsList(memberId) {
    // Calculate total meals for this member
    const totalMeals = AppState.meals
        .filter(m => m.memberId === memberId)
        .reduce((sum, m) => sum + m.breakfast + m.lunch + m.dinner, 0);

    document.getElementById('total-member-meals').textContent = totalMeals;
}

// ============================================
// MODULE 4: MESS EXPENSE LOGGER
// ============================================

/**
 * Add a new expense
 * CHANGE HERE FOR: Send expense data to /api/expenses
 * Expected POST payload: { category, amount, date, description }
 * Expected response: { id, category, amount, date, description }
 */
function addExpense() {
    const category = document.getElementById('expense-category').value;
    const date = document.getElementById('expense-date').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);

    if (!category || !date || !amount || amount <= 0) {
        alert('Please fill in all expense fields');
        return;
    }

    // CHANGE HERE FOR: Send to backend API
    /*
    const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ category, amount, date, description: '' })
    });
    const expense = await response.json();
    AppState.expenses.push(expense);
    */

    // Mock API call
    const expense = {
        id: Date.now(),
        category: category,
        amount: amount,
        date: date,
        description: ''
    };
    AppState.expenses.push(expense);

    // Clear inputs
    document.getElementById('expense-category').value = '';
    document.getElementById('expense-amount').value = '';
    document.getElementById('expense-date').valueAsDate = new Date();

    // Update display
    renderExpensesList();
    updateFinancialAnalytics();
}

/**
 * Render expenses list
 */
function renderExpensesList() {
    const list = document.getElementById('expenses-list');

    if (AppState.expenses.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🧾</div>
                <h4>No expenses recorded</h4>
                <p>Log your first expense</p>
            </div>
        `;
        document.getElementById('total-mess-expense').textContent = '$0.00';
        return;
    }

    // Calculate total
    const total = AppState.expenses.reduce((sum, e) => sum + e.amount, 0);

    list.innerHTML = AppState.expenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(expense => `
            <div class="expense-item">
                <div class="expense-left">
                    <span class="expense-category">${expense.category}</span>
                    <span class="expense-date">${new Date(expense.date).toLocaleDateString()}</span>
                </div>
                <span class="expense-amount">$${expense.amount.toFixed(2)}</span>
            </div>
        `).join('');

    document.getElementById('total-mess-expense').textContent = `$${total.toFixed(2)}`;
}

// ============================================
// MODULE 5: FINANCIAL ANALYTICS
// ============================================

/**
 * Calculate and update all financial analytics
 * 
 * Calculations:
 * 1. Meal Rate = Total Mess Expense / Total Mess Meals
 * 2. Per Person Cost = Individual Total Meals × Meal Rate
 * 3. Final Balance = Individual Total Deposit - Per Person Cost
 */
function updateFinancialAnalytics() {
    // Get selected member
    const memberId = parseInt(document.getElementById('deposit-member-select').value);

    // CALCULATION 1: Calculate Total Mess Meals
    const totalMessMeals = AppState.meals.reduce((sum, meal) => {
        return sum + meal.breakfast + meal.lunch + meal.dinner;
    }, 0);

    // CALCULATION 2: Calculate Total Mess Expense
    const totalMessExpense = AppState.expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // CALCULATION 3: Calculate Meal Rate (Price per meal)
    const mealRate = totalMessMeals > 0 ? totalMessExpense / totalMessMeals : 0;

    // If a member is selected, calculate their specific metrics
    if (memberId) {
        // Get member's total meals
        const memberMeals = AppState.meals
            .filter(m => m.memberId === memberId)
            .reduce((sum, m) => sum + m.breakfast + m.lunch + m.dinner, 0);

        // CALCULATION 4: Calculate Per Person Cost
        const perPersonCost = memberMeals * mealRate;

        // Get member's total deposit
        const memberDeposit = AppState.deposits
            .filter(d => d.memberId === memberId)
            .reduce((sum, d) => sum + d.amount, 0);

        // CALCULATION 5: Calculate Final Settlement
        const settlement = memberDeposit - perPersonCost;

        // Update settlement display with color coding
        updateSettlementDisplay(settlement);

        // Update analytics display
        document.getElementById('analytics-meal-rate').textContent = `$${mealRate.toFixed(2)}`;
        document.getElementById('analytics-total-meals').textContent = totalMessMeals;
        document.getElementById('analytics-per-member-meals').textContent = memberMeals;
        document.getElementById('analytics-per-person-cost').textContent = `$${perPersonCost.toFixed(2)}`;
        document.getElementById('analytics-member-deposit').textContent = `$${memberDeposit.toFixed(2)}`;
        document.getElementById('analytics-settlement').textContent = `${settlement >= 0 ? '+' : ''}$${Math.abs(settlement).toFixed(2)}`;
    } else {
        // No member selected, show totals only
        document.getElementById('analytics-meal-rate').textContent = `$${mealRate.toFixed(2)}`;
        document.getElementById('analytics-total-meals').textContent = totalMessMeals;
        document.getElementById('analytics-per-member-meals').textContent = '0';
        document.getElementById('analytics-per-person-cost').textContent = '$0.00';
        document.getElementById('analytics-member-deposit').textContent = '$0.00';
        document.getElementById('analytics-settlement').textContent = '$0.00';
        
        const container = document.getElementById('analytics-settlement-container');
        container.classList.remove('positive', 'negative');
    }
}

/**
 * Update settlement display with appropriate color coding
 * Green (positive): Member will receive refund
 * Red (negative): Member needs to pay additional
 * @param {number} settlement - Settlement amount
 */
function updateSettlementDisplay(settlement) {
    const container = document.getElementById('analytics-settlement-container');
    const label = container.querySelector('.analytics-label');

    container.classList.remove('positive', 'negative');

    if (settlement > 0) {
        container.classList.add('positive');
        label.textContent = 'Will Receive ✓';
    } else if (settlement < 0) {
        container.classList.add('negative');
        label.textContent = 'Will Pay';
    } else {
        label.textContent = 'Settled';
    }
}

// ============================================
// EVENT LISTENERS FOR TAB SWITCHING
// ============================================
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tab = this.getAttribute('data-tab');
        switchTab(tab);
    });
});
