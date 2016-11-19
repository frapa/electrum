var ElectrumView = AbstractView.extend({
    events: {
        'click #menu-dashboard': 'openDashboard',
        'click #menu-accounts': 'openAccounts',
        'click #menu-reports': 'openReports'
    },

    initialize: function () {
    },

    openDashboard: function () {
        this.open(new DashboardView(), 'main');
    },

    openAccounts: function () {
        this.open(new AccountsView(), 'main');
    },

    openReports: function () {
        this.open(new ReportsView(), 'main');
    },
});
