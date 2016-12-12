var App_View_SingleAccount = AbstractView.extend({
    initialize: function (options) {
        Electrum.router.navigate('accounts/' + this.model.get('Id'));

        var _this = this;

        this.subviews = {
            transactionTable: new Kernel_View_Ui_Table({
                collection: this.model.to('In'),
                inlineEditing: true,
                addingRow: true,
                addingRowBeforeSave: function (model) {
                    model.link('To', _this.model);
                },
                columns: [
                    {header: 'Date', attr: 'Date'},
                    {header: 'Description', attr: 'Description'},
                    {header: 'From', link: 'From', attr: 'Name'},
                    {header: 'To', link: 'To', attr: 'Name'},
                    {header: 'Amount', method: 'getFormattedAmount'},
                ],
            })
        };
    }
});
