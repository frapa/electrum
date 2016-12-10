var App_View_SingleAccount = AbstractView.extend({
    initialize: function (options) {
        Electrum.router.navigate('accounts/' + this.model.get('Id'));

        this.subviews = {
            transactionTable: new Kernel_View_Ui_Table({
                collection: this.model.to('In'),
                inlineEditing: true,
                columns: [
                    {header: 'Date', attr: 'Date'},
                    {header: 'Description', attr: 'Description'},
                    {header: 'From', attr: 'getFrom'},
                    {header: 'To', attr: 'getTo'},
                    {header: 'Amount', attr: 'getFormattedAmount'},
                ],
            })
        };
    }
});
