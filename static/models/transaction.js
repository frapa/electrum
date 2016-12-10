_.extend(App_Model_Transaction.prototype, {
    getFrom: function () {
        return this.to('From').at(0).get('Name');
    },
    
    getTo: function () {
        return this.to('To').at(0).get('Name');
    },

    getFormattedAmount: function () {
        var amount = this.to('Amount').get('Amount') / 100.0;
        var formattedAmount = amount;
        return formattedAmount;
    }
});
