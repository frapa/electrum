var App_View_Ui_Tabbed = AbstractView.extend({
    render: function (options) {
        AbstractView.prototype.render.call(this, options);

        this.hideContent();
        this.bindTabs();
        this.selectStartingTab();
    },

    hideContent: function () {
        this.$('[id^="content-"]').hide();
    },

    bindTabs: function () {
        var _this = this;

        this.$('.tab').each(function (i, tab) {
            var $tab = $(tab);
            var tabName = $tab.attr('id').replace('tab-', '');
            $tab.click(_this.switchToTab.bind(_this, tabName))
        });

    },

    selectStartingTab: function () {
        if (window.location.hash) {
            this.switchToTab(window.location.hash.replace('#', ''));
        } else {
            this.$('.tab.selected').click();
        }
    },

    switchToTab: function (tabName) {
        var $tab = this.$('#tab-' + tabName);
        var $content = this.$('#content-' + tabName);

        this.$('.tab.selected').removeClass('selected');
        $tab.addClass('selected');

        this.hideContent();
        $content.show();

        window.location.hash = tabName;
    },
});
