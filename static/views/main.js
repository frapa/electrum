var App_View_Main = AbstractView.extend({
    initialize: function () {
        this.dashboardView = new DashboardView();
        
        this.assetsView = new AccountsView('Assets', 'assets');
        this.incomesView = new AccountsView('Income', 'income');
        this.expensesView = new AccountsView('Expenses', 'expenses');
        
        this.reportsView = new ReportsView();
    },

    events: {
        'click #menu-dashboard': function () {
            Electrum.router.navigate('/dashboard', {trigger: true});
        },
        'click #menu-accounts': function () {
            Electrum.router.navigate('/accounts', {trigger: true});
        },
        
        'click #menu-assets': function () {
            Electrum.router.navigate('/assets', {trigger: true});
        },
        'click #menu-incomes': function () {
            Electrum.router.navigate('/incomes', {trigger: true});
        },
        'click #menu-expenses': function () {
            Electrum.router.navigate('/expenses', {trigger: true});
        },
        
        'click #menu-reports': function () {
            Electrum.router.navigate('/reports', {trigger: true});
        },
    },

    openDashboard: function () {
        this.open(this.dashboardView, 'main');
    },

    openAssets: function () {
        this.open(this.assetsView, 'main');
    },
    
    openIncomes: function () {
        this.open(this.incomesView, 'main');
    },
    
    openExpenses: function () {
        this.open(this.expensesView, 'main');
    },

    openReports: function () {
        this.open(this.reportsView, 'main');
    },
});
