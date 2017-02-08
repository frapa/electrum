var App_View_Main = AbstractView.extend({
    initialize: function () {
        this.dashboardView = new App_View_DashboardView();
        
        this.assetsView = new App_View_AccountsView('Assets', 'asset');
        this.incomeView = new App_View_AccountsView('Income', 'income');
        this.expensesView = new App_View_AccountsView('Expenses', 'expense');
        
        this.reportsView = new App_View_ReportsView();

        this.menu = new App_View_Menu();
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
        'click #menu-income': function () {
            Electrum.router.navigate('/income', {trigger: true});
        },
        'click #menu-expenses': function () {
            Electrum.router.navigate('/expenses', {trigger: true});
        },
        
        'click #menu-reports': function () {
            Electrum.router.navigate('/reports', {trigger: true});
        },

        'click #logo-header': 'toggleMenu'
    },

    openDashboard: function () {
        this.open(this.dashboardView, 'main');
    },

    openAssets: function () {
        this.open(this.assetsView, 'main');
    },
    
    openIncome: function () {
        this.open(this.incomeView, 'main');
    },
    
    openExpenses: function () {
        this.open(this.expensesView, 'main');
    },

    openReports: function () {
        this.open(this.reportsView, 'main');
    },

    toggleMenu: function () {
        if (this.menu.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    },

    openMenu: function () {
        this.menu.open()
        this.open(this.menu, 'menu');
    },
    
    closeMenu: function () {
        this.menu.close();
    },
});
