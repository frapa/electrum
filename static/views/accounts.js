Electrum.accounts = new App_Collection_Account({url: '/controller/accounts/root'});
Electrum.allAccounts = new App_Collection_Account();

var AccountsView = AbstractView.extend({
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
                        var dialog = new App_View_Dialog_NewAccount(this.model, this.childCollection);
                        dialog.show(this.$button, 'ne', {tableAction: true});
                    },
                    tooltip: 'Add subaccount'
                },
                {
                    icon: 'icon-trash',
                    callback: function () {
                        var model = this.model;

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
                    tooltip: 'Delete'
                },
            ]
        }),
    }
});
