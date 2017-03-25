var App_View_Report_Table = AbstractView.extend({
    initialize: function () {
        this.addView('table', new Kernel_View_Ui_ConfigTable({
            collection: new App_Collection_Transaction(),
            openConfig: true,
            columns: [
                {
                    attr: 'Description'
                }
            ],
        }));
    },

    /*render: function () {
        this.setElement($('<div>asss</div>'));
    }*/
});
