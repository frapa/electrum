Electrum.router = new Backbone.Router({
    routes: {
        '': function () {
            Electrum.router.navigate('/dashboard');
        },
        'dashboard': function () {
            Electrum.mainView.openDashboard();
        },
        'accounts': function () {
            Electrum.mainView.openAccounts();
        },
        'accounts/:id': function (id) {
            Electrum.allAccounts.fetch({
                success: function () {
                    Electrum.mainView.open(new App_View_SingleAccount({
                        model: Electrum.allAccounts.where({Id: id})[0]
                    }), 'main');
                }
            });
        },
        'assets': function () {
            Electrum.mainView.openAssets();
        },
        'incomes': function () {
            Electrum.mainView.openIncomes();
        },
        'expenses': function () {
            Electrum.mainView.openExpenses();
        },
        'reports': function () {
            Electrum.mainView.openReports();
        }
    },
});
