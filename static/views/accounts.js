Electrum.allAccounts = new App_Collection_Account();

var AccountsView = AbstractView.extend({
	initialize: function (title, filterBy) {
        this.title = title;
        this.filterBy = filterBy;
    },

    events: {
        'click #add-account': 'showAddAccountDialog'
    },
    
    showAddAccountDialog: function () {
        var dialog = new App_View_Dialog_NewAccount(
            this.rootAccount,
            this.accounts,
            true
        );
		dialog.show(this.$('#add-account'), 'nc');
    },

    fetchRootAccount: function (callback) {
        var _this = this;

        var fetchFirstLevelSubAccounts = function (root, callback) {
            root.to('SubAccounts').fetch({
                success: function (subAccounts) {
                    _this.rootAccount = root;
                    _this.accounts = subAccounts;
                    callback(root, subAccounts);
                }
            });
        };

        var fetchType = function (callback) {
            Electrum.currentBook.to('RootAccounts')
                .params({
                    Type: _this.filterBy
                }).fetch({
                    success: function (accounts) {
                        var root = accounts.at(0);
                        fetchFirstLevelSubAccounts(root, callback);                   
                    }
                });
        };

        var globalName = this.filterBy + 'Accounts';
        // capitalize first letter
        var rootGlobalName = 'root' + globalName.charAt(0).toUpperCase() + globalName.slice(1);
        if (!(globalName in Electrum)) {
            fetchType(function (root, accounts) {
                Electrum[rootGlobalName] = root;
                Electrum[globalName] = accounts;
                callback();
            });
        } else {
            _this.rootAccount = Electrum[rootGlobalName];
            _this.accounts = Electrum[globalName];
            callback();
        }
    },

    addSubviews: function () {
        var extraColumns = [];
        if (this.filterBy == 'asset') {
            extraColumns.push({header: 'Total', method: 'getTotalCache'});
        } else if (this.filterBy == 'income') {
            extraColumns.push({header: 'This Month', method: 'getMonthCache'});
            extraColumns.push({header: 'This Year', method: 'getYearCache'});
        } else if (this.filterBy == 'expense') {
            extraColumns.push({header: 'This Month', method: 'getMonthCache'});
            extraColumns.push({header: 'This Year', method: 'getYearCache'});
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
				].concat(extraColumns),
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
        var _this = this;

        var renderIntern = function () {
            _this.addSubviews();

            options = options ? options : {};

            options.anmgr.waitForAction();
            _this.accounts.fetch({success: function () {
                options.anmgr.notifyEnd();
            }});

            AbstractView.prototype.render.call(_this, _.extend(options, {
                templateObj: {title : _this.title}
            }));

            options.anmgr.notifyEnd();
        };
        
        options.anmgr.waitForAction();
        if (!Electrum.currentBook) {
            var books = new App_Collection_Book();

            books.fetch({
                success: function (books) {
                    Electrum.currentBook = books.at(0);
                    _this.fetchRootAccount(renderIntern);
                }});
        } else {
            _this.fetchRootAccount(renderIntern);
        }
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
