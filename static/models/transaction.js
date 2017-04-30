_.extend(App_Model_Transaction.prototype, {
    getFormattedAmount: function () {
        if (this.isNew() && this.get('Amount') === undefined) {
            return '';
        }

        var amount = this.get('Amount') / 100.0;
        var formattedAmount = amount.toFixed(2);
        return formattedAmount;
    },

    parseFloat: function (float) {
        return parseFloat(float);
    },

    parseAmount: function (value) {
        var amount = 0;
        if (value) {
            // allow some basic math operations in the input
            var isThereMath =
                value.indexOf('+') != -1 ||
                value.indexOf('-') != -1 ||
                value.indexOf('*') != -1 ||
                value.indexOf('/') != -1;

            if (isThereMath) {
                amount = this.parseMathAmount(value);
            } else {
                amount = parseInt(this.parseFloat(value) * 100);
            }
        }

        return amount;
    },

    // Extremely simple math parser! Does not support braces.
    parseMathAmount: function (value) {
        var tockens = value.split(/\+|-/);
        var operators = value;
        _.each(tockens, function (tocken) {
            operators = operators.replace(tocken, '');
        });

        var amount = this.parseFloat(tockens[0]);
        _.each(tockens.slice(1), function (tocken, i) {
            var subTockens = tocken.split(/\*|\//);
            var subOperators = tocken;
            _.each(subTockens, function (t) {
                subOperators = subOperators.replace(t, '');
            });

            var subAmount = this.parseFloat(subTockens[0]);
            _.each(subTockens.slice(1), function (subTocken, j) {
                var operator = subOperators.slice(j, j+1);
                if (operator == '*') {
                    subAmount *= this.parseFloat(subTocken);
                } else {
                    subAmount /= this.parseFloat(subTocken);
                }
            });

            var operator = operators.slice(i, i+1);
            if (operator == '+') {
                amount += subAmount;
            } else {
                amount -= subAmount;
            }
        });

        return parseInt(amount * 100);
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
            var from = model.to('From').at(0);
            var fromId = from.id;
            var to = model.to('To').at(0);
            var toId = to.id;

            var oldCallback = options && options.success;
            options.success = function (transaction) {
                if (transaction) {
                    Backbone.ajax({
                        url: '/controller/transaction/updateAccountTotals/' + fromId + '/' + toId
                    });

                    from.fetch();
                    to.fetch();
                }

                if (oldCallback) oldCallback.apply(null, arguments);
            }
            
            RelationalModel.prototype.destroy.call(model, options);
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
