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

    sync: function (method, model, opts) {
        var options = opts ? opts : {};

        var atTheEnd = new AsyncNotificationManager(function () {
            var fromId, toId;
            if (model.isNew()) {
                toId = "new";
            } else {
                fromId = model.to('From').at(0).id;
                toId = model.to('To').at(0).id;
            }

            var oldCallback = options && options.success;
            options.success = function (transaction) {
                if (method != 'GET' && transaction) {
                    if (toId == 'new') fromId = transaction.Id;

                    Backbone.ajax({
                        url: '/controller/transaction/updateAccountTotals/' + fromId + '/' + toId
                    });
                }

                if (oldCallback) oldCallback.apply(null, arguments);
            }
            
            Backbone.sync(method, model, options);
        });

        if (!model.isNew()) {
            atTheEnd.waitForAction();
            model.to('From').fetch({
                success: function () {
                    atTheEnd.notifyEnd();
                }
            });
            atTheEnd.waitForAction();
            model.to('To').fetch({
                success: function () {
                    atTheEnd.notifyEnd();
                }
            });
        }

        atTheEnd.notifyEnd();
    },

    destroy: function (opts) {
        var options = opts ? opts : {};
        var model = this;

        var atTheEnd = new AsyncNotificationManager(function () {
            var fromId = model.to('From').at(0).id;
            var toId = model.to('To').at(0).id;

            var oldCallback = options && options.success;
            options.success = function (transaction) {
                if (transaction) {
                    Backbone.ajax({
                        url: '/controller/transaction/updateAccountTotals/' + fromId + '/' + toId
                    });
                }

                if (oldCallback) oldCallback.apply(null, arguments);
            }
            
            Relational_Model.prototype.destroy.call(model, options);
        });

        atTheEnd.waitForAction();
        model.to('From').fetch({
            success: function () {
                atTheEnd.notifyEnd();
            }
        });
        atTheEnd.waitForAction();
        model.to('To').fetch({
            success: function () {
                atTheEnd.notifyEnd();
            }
        });

        atTheEnd.notifyEnd();
    }
});
