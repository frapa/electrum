var App_View_Menu = AbstractView.extend({
    events: {
        'click #menu-import-gnucash': 'importGnucash',
        'click #menu-export-gnucash': 'exportGnucash'
    },

    initialize: function () {
        this.isOpen = false;
    },

    // imports
    importGnucash: function () {
        Electrum.router.navigate('/import/gnucash',
            {trigger: true});
        this.close();
    },

    // exports
    exportGnucash: function () {
        Electrum.router.navigate('/export/gnucash',
            {trigger: true});
        this.close();
    },

    open: function () {
        this.isOpen = true;
    },

    close: function () {
        this.isOpen = false;

        AbstractView.prototype.close.call(this);

        Electrum.mainView.close('menu');
    }
});
