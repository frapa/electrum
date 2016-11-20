Electrum.accounts = new App_Collection_Account();

var AccountsView = AbstractView.extend({
    subviews: {
        'accountsTable': new Kernel_View_Ui_Tree({
            collection: Electrum.accounts,
            children: 'SubAccounts',
            columns: [
                {header: 'Name', attr: 'Name'},
                {header: 'Description', attr: 'Description'},
                {header: 'Total', method: 'computeTotal'}
            ]
        }),
    }
});
