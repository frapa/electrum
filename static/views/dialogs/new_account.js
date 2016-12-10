var App_View_Dialog_NewAccount = Kernel_View_Ui_Dialog.extend({
    title: 'Add subaccount',

    subviews: {
        name: new Kernel_View_Ui_Entry({label: 'Name'})
    },

    buttons: {
        Cancel: function () { return true; },
        Create: function (views) {
            var newAccount = new App_Model_Account({
                Name: views.name.getValue()
            }); 
            newAccount.link('Parent',
                views.parent.getSelectedModel());

            this.collection.add(newAccount);
            newAccount.save();

            return true;
        }
    },

    initialize: function (parent, collection) {
        this.collection = collection;

        this.subviews.parent = new Kernel_View_Ui_Selectbox({
            collection: Electrum.allAccounts,
            selected: parent,
            attr: 'Name',
            label: 'Parent'
        });
    }
});
