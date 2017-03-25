var App_View_Report = AbstractView.extend({
    subviews: {
        'name': new Kernel_View_Ui_Entry({
            autoFocus: true,
        })
    },

    initialize: function (options) {
        this.tabs = [{name: 'Table 1', tab: new App_View_Report_Table()}];
        this.selectedTab = 0;

        this.addView('tab-content', this.tabs[this.selectedTab].tab);
    },

    render: function (options) {
        var _this = this;

        options.anmgr.waitForAction();
        this.model.fetch({
            success: function () {
                AbstractView.prototype.render.call(_this, _.extend({
                    templateObj: {
                        tabs: _.pluck(this.tabs, 'name')
                    }
                }, options));
                options.anmgr.notifyEnd();
            }
        });
    }
});
