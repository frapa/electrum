Electrum.router = new Backbone.Router({
    routes: {
        // dashboard
        '': function () {
            Electrum.router.navigate('/dashboard', {trigger: true});
        },
        'dashboard': function () {
            Electrum.mainView.openDashboard();
        },

        // accounts
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
        'asset': function () {
            Electrum.mainView.openAssets();
        },
        'income': function () {
            Electrum.mainView.openIncome();
        },
        'expenses': function () {
            Electrum.mainView.openExpenses();
        },
        'expense': function () {
            Electrum.mainView.openExpenses();
        },

        // reports
        'reports': function () {
            Electrum.mainView.openReports();
        },
        'report/:id': function (id) {
            var reportView = new App_View_Report({
                model: new App_Model_Report(id == 'new' ? {} : {Id: id})
            });

            Electrum.mainView.open(reportView, 'main');
        },

        // imports
        'import/gnucash': function () {
            var gnucashImporter = new App_View_Import_Gnucash();
            Electrum.mainView.open(gnucashImporter, 'main');
        },

        // exports
        'export/gnucash': function () {
            var gnucashExporter = new App_View_Export_Gnucash();
            Electrum.mainView.open(gnucashExporter, 'main');
        },
        
        // user
        'user/settings': function () {
			var userSettings = new App_View_UserSettings();
			Electrum.mainView.open(userSettings, 'main');
		},
    }
});
