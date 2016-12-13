var App_View_Main = AbstractView.extend({
    initialize: function () {
        this.dashboardView = new DashboardView();
        this.accountsView = new AccountsView();
        this.categoriesView = new CategoriesView();
        this.reportsView = new ReportsView();
    },

    events: {
        'click #menu-dashboard': function () {
            Electrum.router.navigate('/dashboard', {trigger: true});
        },
        'click #menu-accounts': function () {
            Electrum.router.navigate('/accounts', {trigger: true});
        },
        'click #menu-categories': function () {
            Electrum.router.navigate('/categories', {trigger: true});
        },
        'click #menu-reports': function () {
            Electrum.router.navigate('/reports', {trigger: true});
        },
    },

    openDashboard: function () {
        this.open(this.dashboardView, 'main');
    },

    openAccounts: function () {
        this.open(this.accountsView, 'main');
    },
    
    openCategories: function () {
        this.open(this.categoriesView, 'main');
    },

    openReports: function () {
        this.open(this.reportsView, 'main');
    },
});
