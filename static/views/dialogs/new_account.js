var App_View_Dialog_NewAccount = Kernel_View_Ui_Dialog.extend({
    title: 'Add subaccount',

    buttons: {
        Cancel: function () { return true; },
        Create: 'createAccount'
    },
    
    createAccount: function (views) {
        var parent = null;
        if (this.parent === undefined) {
            parent = views.parent.getSelectedModel();
        } else {
            parent = this.parent;
        }

        var newAccount = new App_Model_Account({
            Name: views.name.getValue(),
            Father: 0,
            Type: parent.get('Type')
        }); 
        newAccount.link('Parent', parent);

        console.info(123888);
        this.collection.add(newAccount);
        newAccount.save();

        return true;
    },

    initialize: function (parent, collection, add) {
        this.collection = collection;

        this.subviews = {
            name: new Kernel_View_Ui_Entry({label: 'Name'})
        };

        if (add) {
            this.title = 'Add Account';
            this.parent = parent;
        } else {
            this.subviews.parent = new Kernel_View_Ui_Selectbox({
                collection: Electrum.allAccounts,
                selected: parent,
                attr: 'Name',
                label: 'Parent'
            });
        }
    }
});
