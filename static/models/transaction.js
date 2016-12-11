_.extend(App_Model_Transaction.prototype, {
    getFormattedAmount: function () {
        if (this.isNew()) {
            return;
        }

        var amount = this.to('Amount').get('Amount') / 100.0;
        var formattedAmount = amount;
        return formattedAmount;
    }
});
