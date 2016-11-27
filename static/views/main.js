var ElectrumView = AbstractView.extend({
    initialize: function () {
        this.dashboardView = new DashboardView();
        this.accountsView = new AccountsView();
        this.reportsView = new ReportsView();
    },

    events: {
        'click #menu-dashboard': 'openDashboard',
        'click #menu-accounts': 'openAccounts',
        'click #menu-reports': 'openReports'
    },

    openDashboard: function () {
        this.open(this.dashboardView, 'main');
    },

    openAccounts: function () {
        this.open(this.accountsView, 'main');
    },

    openReports: function () {
        this.open(this.reportsView, 'main');
    },
});
