Electrum.allAccounts = new App_Collection_Account();
Electrum.assetAccounts = new App_Collection_Account({
    url: '/controller/accounts/assets'
});
Electrum.incomeAccounts = new App_Collection_Account({
    url: '/controller/accounts/income'
});
Electrum.expensesAccounts = new App_Collection_Account({
    url: '/controller/accounts/expenses'
});

var AccountsView = AbstractView.extend({
	initialize: function (title, filterBy) {
        this.title = title;
        this.filterBy = filterBy;

        if (filterBy == 'assets') {
            this.accounts = Electrum.assetAccounts;
        } else if (filterBy == 'income') {
            this.accounts = Electrum.incomeAccounts;
        } else if (filterBy == 'expenses') {
            this.accounts = Electrum.expensesAccounts;
        } else {
            console.error("There exists no account type '" + filterBy + "'");
        }
		
		this.subviews = {
			'accountsTable': new Kernel_View_Ui_Tree({
				collection: this.accounts,
				children: 'SubAccounts',
				columns: [
					{header: 'Name', attr: 'Name'},
					{header: 'Description', attr: 'Description'},
					{header: 'Total', method: 'computeTotal'},
					{header: 'Total', method: 'computeLastMonth'},
					{header: 'Total', method: 'computeLastYear'}
				],
				click: this.openAccount.bind(this),
				actions: [
					{
						icon: 'icon-list-add',
						callback: this.showAddSubaccountDialog.bind(this),
						tooltip: 'Add subaccount'
					},
					{
						icon: 'icon-trash',
						callback: this.showDeleteDialog.bind(this),
						tooltip: 'Delete'
					},
				]
			}),
		};
	},

    events: {
        'click #add-account': 'showAddAccountDialog'
    },
    
    showAddAccountDialog: function () {
        var dialog = new App_View_Dialog_NewAccount(
            this.rootAccount.at(0),
            this.accounts,
            true
        );
		dialog.show(this.$('#add-account'), 'nc');
    },
	
	render: function (options) {
		options = options ? options : {};

        this.rootAccount = new App_Collection_Account({
            query: 'Father=1&Type=' + this.filterBy
        });

        options.anmgr.waitForAction();
        this.rootAccount.fetch({success: function () {
            options.anmgr.notifyEnd();
        }});
		
		AbstractView.prototype.render.call(this, _.extend(options, {
			templateObj: {title : this.title}
		}));
	},
	
	openAccount: function (account) {
		Electrum.mainView.open(
			new App_View_SingleAccount({model: account}),
			'main'
		);
	},
	
	showAddSubaccountDialog: function (obj) {
        var dialog = new App_View_Dialog_NewAccount(obj.model,
            obj.childCollection);
		dialog.show(obj.$button, 'ne', {tableAction: true});
	},
	
	showDeleteDialog: function (obj) {
		var model = obj.model;

		var dialog = Kernel_View_Ui_Dialog.extend({
			title: 'Delete?',
            template: _.template('<p>Are you sure you want to delete account "' +
                obj.model.get('Name') +
                '"?</p><p>All subaccounts will also be deleted.</p>'),
			buttons: {
				Cancel: function () {
					return true;
				},
				Delete: function () {
					model.destroy();
					return true;
				}
			}
		});
		(new dialog()).show(obj.$button, 'ne', {tableAction: true});
	},
	
});
