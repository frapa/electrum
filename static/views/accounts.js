Electrum.accounts = new App_Collection_Account({url: '/controller/accounts/root'});
Electrum.allAccounts = new App_Collection_Account();

var AccountsView = AbstractView.extend({
<<<<<<< HEAD
    subviews: {
        'accountsTable': new Kernel_View_Ui_Tree({
            collection: Electrum.accounts,
            children: 'SubAccounts',
            columns: [
                {header: 'Name', attr: 'Name'},
                {header: 'Description', attr: 'Description'},
                {header: 'Total', method: 'computeTotal'}
            ],
            click: function (account) {
                Electrum.mainView.open(
                    new App_View_SingleAccount({model: account}),
                    'main'
                );
            },
            actions: [
                {
                    icon: 'icon-list-add',
                    callback: function () {
                        var dialog = new App_View_Dialog_NewAccount(
                            this.model, this.childCollection);
                        dialog.show(this.$button, 'ne', {tableAction: true});
                    },
                    tooltip: 'Add subaccount'
                },
                {
                    icon: 'icon-trash',
                    callback: function () {
                        var model = this.model;
=======
	initialize: function (title, filterBy) {
		var rootAccounts = new App_Collection_Account(
			Electrum.accounts.where({Type: filterBy})
			);
		
		console.log(rootAccounts)
		
		rootAccounts.fetched = true;
		
		this.title = title;
		
		this.subviews = {
			'accountsTable': new Kernel_View_Ui_Tree({
				collection: rootAccounts,
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
	
	render: function (options) {
		options = options ? options : {};
		
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
	
	showAddSubaccountDialog: function () {
		var dialog = new App_View_Dialog_NewAccount(this.model, this.childCollection);
		dialog.show(this.$button, 'ne', {tableAction: true});
	},
	
	showDeleteDialog: function () {
		var model = this.model;
>>>>>>> 2c6a5cebbe65754e4f02b5c9f07ed24b66b42533

		var dialog = Kernel_View_Ui_Dialog.extend({
			title: 'Delete?',
			template: _.template('<p>Are you sure you want to delete account "' +
				this.model.get('Name') + '"?</p><p>All subaccounts will also be deleted.</p>'),
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
		(new dialog()).show(this.$button, 'ne', {tableAction: true});
	},
	
});
