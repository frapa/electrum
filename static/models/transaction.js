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
    },

    sync: function (method, model, options) {
        var oldCallback = options.success;
        options.success = function (transaction) {
            if (method != 'GET') {
                httpReq({
                    url: '/controller/transaction/updateAccountTotals/' + transaction.Id
                });
            }

            oldCallback();
        }
        
        return Backbone.sync(method, model, options);
    }
});
