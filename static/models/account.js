_.extend(App_Model_Account.prototype, {
    getTotalCache: function () {
        return this.get('TotalCache') / 100.0;
    },

    getMonthCache: function () {
        return this.get('MonthCache') / 100.0;
    },

    getYearCache: function () {
        return this.get('YearCache') / 100.0;
    },
});
