Electrum.accounts = new App_Collection_Account({url: '/controller/accounts/root'});

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
            actions: [
                {
                    icon: 'icon-list-add',
                    callback: function () {
                        alert('+');
                    },
                    tooltip: 'Add subaccount'
                },
            ]
        }),
    }
});
