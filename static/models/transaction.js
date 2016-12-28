_.extend(App_Model_Transaction.prototype, {
    getFormattedAmount: function () {
        if (this.isNew() && this.get('Amount') === undefined) {
            return '';
        }

        var amount = this.get('Amount') / 100.0;
        var formattedAmount = amount.toFixed(2);
        return formattedAmount;
    },

    parseAmount: function (value) {
        var amount = 0;
        if (value)
            amount = parseInt(parseFloat(value) * 100);

        return amount;
    },
    
    setAmount: function (value) {
        this.set({Amount: this.parseAmount(value)});
    }
});
