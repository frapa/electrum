var App_View_Export_Gnucash = AbstractView.extend({
    events: {
        'click #export-button': 'export'
    },

    export: function () {
        window.location = '/controller/export/gnucash/?user=' + global.username +
            '&psw=' + global.password;
    },
});
