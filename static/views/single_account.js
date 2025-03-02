var App_View_SingleAccount = AbstractView.extend({
    events: {
        'click .back-button': 'goBack'
    },

    goBack: function () {
        Electrum.router.navigate('/' + this.type, {trigger: true});
    },

    initialize: function (options) {
        Electrum.router.navigate('accounts/' + this.model.get('Id'));

        // Depending on type, show different columns
        var type = this.model.get('Type');
        this.type = type;
        var customizations = null;
        if (type == "expense") {
            customization = this.customizeExpense();
        } else if (type == "income") {
            customization = this.customizeIncome();
        } else if (type == "asset") {
            customization = this.customizeAsset();
        }
        var columns = customization[0];
        var funcBeforeSave = customization[1];
        var collection = customization[2];

        this.subviews = {
            transactionTable: new Kernel_View_Ui_Table({
                collection: collection,
                inlineEditing: true,
                addingRow: true,
                initializeAddingModel: this.initializeAddingModel.bind(this),
                beforeSave: funcBeforeSave,
                columns: columns,
                order: 'Date desc',
                actions: [
					{
						icon: 'icon-trash',
						callback: this.deleteTransaction.bind(this),
						tooltip: 'Delete'
					},
				]

            })
        };
    },

    initializeAddingModel: function (model) {
        if (this.lastDate !== undefined) {
            model.set('Date', this.lastDate);
        }
        
        if (this.lastLink !== undefined && this.linkAttr !== undefined) {
            model.link(this.linkAttr, this.lastLink);
        }
    },

    customizeExpense: function () {
        var _this = this;
        this.linkAttr = 'From';

        var columns = [
            {header: 'Date', attr: 'Date'},
            {header: 'Description', attr: 'Description'},
            {header: 'From', link: 'From', attr: 'Name'},
            {header: 'Spent', type: 'float',
                method: 'getFormattedAmount',
                onSave: function (cell, transaction, value) {
                    transaction.setAmount(value);
                    _this.cacheLastValues(transaction, 'From');
                }
            },
        ];

        var funcBeforeSave = function (transaction) {
            transaction.link('To', _this.model);
        };

        var collection = this.model.to('In');

        return [columns, funcBeforeSave, collection];
    },

    customizeIncome: function () {
        var _this = this;
        this.linkAttr = 'To';

        var columns = [
            {header: 'Date', attr: 'Date'},
            {header: 'Description', attr: 'Description'},
            {header: 'To', link: 'To', attr: 'Name'},
            {header: 'Earned', type: 'float',
                method: 'getFormattedAmount',
                onSave: function (cell, transaction, value) {
                    transaction.setAmount(value);
                    _this.cacheLastValues(transaction, 'To');
                }
            },
        ];

        var funcBeforeSave = function (transaction) {
            transaction.link('From', _this.model);
        };
        
        var collection = this.model.to('Out');

        return [columns, funcBeforeSave, collection];
    },

    customizeAsset: function () {
        var columns = [
            {header: 'Date', attr: 'Date'},
            {header: 'Description', attr: 'Description'},
            {header: 'Transfer', type: 'link',
                linkedCollectionInst: Electrum.allAccounts,
                compute: this.getTransfer.bind(this),
                onSave: this.saveTransfer.bind(this)
            },
            {header: 'In', type: 'float', 
                compute: this.computeIn.bind(this),
                onSave: this.saveIn.bind(this)
            },
            {header: 'Out', type: 'float',
                compute: this.computeOut.bind(this),
                onSave: this.saveOut.bind(this)
            },
        ];

        var _this = this;
        var funcBeforeSave = this.saveAssetTransaction.bind(this);

        var collection = new App_Collection_Transaction(null, {
            url: '/controller/accounts/InOut/' + _this.model.id
        });

        return [columns, funcBeforeSave, collection];
    },

    computeIn: function (transaction, cell, anmgr) {
        anmgr.waitForAction();
        var setData = function (link) {
            if (link == 'From') {
                cell.data = transaction.getFormattedAmount();
                transaction.transferIn = transaction.get('Amount');
            } else {
                cell.data = '';
                transaction.transferIn = 0;
            }

            anmgr.notifyEnd();
            return cell.data;
        };

        if (transaction.transfer !== undefined) {
            return setData(transaction.transfer);
        } else {
            transaction.once('transfer_found', setData);
        }
    },

    computeOut: function (transaction, cell, anmgr) {
        anmgr.waitForAction();
        var setData = function (link) {
            if (link == 'To') {
                cell.data = transaction.getFormattedAmount();
                transaction.transferOut = transaction.get('Amount');
            } else {
                cell.data = '';
                transaction.transferOut = 0;
            }

            anmgr.notifyEnd();
            return cell.data;
        };

        if (transaction.transfer !== undefined) {
            return setData(transaction.transfer);
        } else {
            transaction.once('transfer_found', setData);
        }
    },

    getTransfer: function (transaction, cell, anmgr) {
        cell.attr = 'Name';

        var emptyCounter = 2;
        var notifyEmpty = function () {
            emptyCounter -= 1;
            if (emptyCounter == 0) {
                transaction.transfer = '';
                transaction.trigger('transfer_found', '');
            }
        };

        anmgr.waitForAction();
        var _this = this;
        var accountId = this.model.id;
        transaction.to('From').fetch({
            success: function (collection) {
                if (collection.length) {
                    var fromAccount = collection.at(0);
                    if (fromAccount.id != accountId) {
                        cell.data = fromAccount.get('Name');
                        cell.usedLink = 'From';
                        cell.collection = transaction.to('From');

                        // save for access in other functions of the same row
                        // I know it's a bit brutal and hacky, but works well
                        transaction.transfer = 'From';
                        transaction.trigger('transfer_found', 'From');
                    }
                } else {
                    notifyEmpty();
                }

                anmgr.notifyEnd();
            }
        });

        anmgr.waitForAction();
        transaction.to('To').fetch({
            success: function (collection) {
                if (collection.length) {
                    var toAccount = collection.at(0);
                    if (toAccount.id != accountId) {
                        cell.data = toAccount.get('Name');
                        cell.usedLink = 'To';
                        cell.collection = transaction.to('To');

                        // see comment above
                        transaction.transfer = 'To';
                        transaction.trigger('transfer_found', 'To');
                    }
                } else {
                    notifyEmpty();
                }
                
                anmgr.notifyEnd();
            }
        });

        // Necessary when it isn't asyncronous
        return cell.data;
    },

    saveIn: function (cell, transaction, value) {
        var amount = transaction.parseAmount(value);
        transaction.transferIn = amount;
    },

    saveOut: function (cell, transaction, value) {
        var amount = transaction.parseAmount(value);
        transaction.transferOut = amount;
    },

    saveTransfer: function (cell, transaction, account) {
        transaction.transferLink = account;
    },

    saveAssetTransaction: function (transaction) {
        inAmount = transaction.transferIn ? transaction.transferIn : 0;
        outAmount = transaction.transferOut ? transaction.transferOut : 0;

        netAmount = inAmount - outAmount;

        if (netAmount === 0) {
            console.warn('Transaction amount is zero. This seems a human error.');
        }

        var direction = netAmount > 0 ? 'From' : 'To';
        var notDirection = direction == 'From' ? 'To' : 'From';
        var absAmount = Math.abs(netAmount);

        transaction.set({Amount: absAmount});

        if (transaction.transferLink === undefined) {
            console.warn('Transaction has no linked account. This seems a human error.');
            return;
        }

        transaction.relink(direction, transaction.transferLink);
        transaction.relink(notDirection, this.model);

        this.cacheLastValues(transaction, direction);
    },

    cacheLastValues: function (transaction, attr) {
        // Cache some values for the next insertion
        this.lastDate = transaction.get('Date');
        this.lastLink = transaction.to(attr).at(0);
    },

    deleteTransaction: function (data)
    {
        var transactions = this.getView('transactionTable').collection;
        transactions.remove(data.model);

        var cancel = false;
        message = new StatusMessage({
            message: '<strong>' + data.model.get('Description') + '</strong> deleted.',
            actions: [
                {
                    text: 'Undo',
                    callback: function () {
                        cancel = true;
                        transactions.add(data.model);
                    }
                }
            ],
            end: function () {
                if (!cancel) data.model.destroy();
            }
        });
        message.show();
    }
});
