var App_View_Reports = AbstractView.extend({
    render: function (options) {
        var _this = this;
        var reports = new App_Collection_PredefinedReport();

        options.anmgr.waitForAction();
        reports.fetch({
            success: function (reports) {
                AbstractView.prototype.render.call(_this, _.extend({
                    templateObj: {
                        reports: reports
                    }
                }, options));
                options.anmgr.notifyEnd();
            }
        });
    },
});
