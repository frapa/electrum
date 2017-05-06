var App_View_UserSettings = App_View_Ui_Tabbed.extend({
    initialize: function () {
        this.subviews =  {
            'accountEmail': new Kernel_View_Ui_Entry({
                label: 'E-mail'
            }),
            'firstName': new Kernel_View_Ui_Entry({
                label: 'First Name'
            }),
            'lastName': new Kernel_View_Ui_Entry({
                label: 'Last Name'
            }),
            'telegram': new App_View_Telegram(),
        };
    },

    events: {
        'click #telegram-connect': 'connectWithTelegram'
    },

    connectWithTelegram: function () {
        var _this = this;

        var ta = new Contact_Model_TelegramAccount();
        ta.link('Contact', this.contact);

        ta.save(null, {
            success: function () {
                _this.telegramAccounts = new Contact_Model_TelegramAccount([ta]);
                _this.getView('telegram').setTelegramAccount(ta).rerender();
            }
        });
    },

    // Get the information we need to fill the page
    retrieveData: function (callback) {
        var _this = this;

        // This happens when the login redirect to this page
        if (global.accountData === undefined) {
            callback();
            return;
        }

        var contact = new Contact_Model_Contact({Id: global.accountData.contactId});

        contact.fetch({
            success: function (contact) {
                _this.contact = contact;

                contact.to('TelegramAccounts').fetch({
                    success: function (telegramAccounts) {
                        _this.telegramAccounts = telegramAccounts;
                        if (_this.telegramAccounts.length)
                            _this.getView('telegram').setTelegramAccount(telegramAccounts.at(0));

                        callback();
                    }
                });
            }
        });
    },

    setUiData: function () {
        this.getView('accountEmail').setValue(global.accountData !== undefined ?
            global.accountData.email : '');
        this.getView('firstName').setValue(this.contact.get('FirstName'));
        this.getView('lastName').setValue(this.contact.get('LastName'));
    },

	render: function (options) {
        var _this = this;

        options.anmgr.waitForAction();
        this.retrieveData(function () {
            _this.setUiData();

            App_View_Ui_Tabbed.prototype.render.call(_this, _.extend({
                templateObj: {
                    username: global.accountData !== undefined ?
                        global.accountData.username : '',
                }
            }, options));

            options.anmgr.notifyEnd();
        });
	},
});

var App_View_Telegram = AbstractView.extend({
    render: function (options) {
        var _this = this;

        if (this.telegramAccount) {
            var url = 'https://t.me/frapa_electrum_bot/?start=' +
                this.telegramAccount.get('Tocken');

            options.anmgr.waitForAction();
            loadScript('/static/content/libs/contact/qrcode.min.js')
                .then(function () {
                    _this.$qrcontainter = $('<span id="telegram-qrcode"></span>');
                    _this.qrcode = new QRCode(_this.$qrcontainter[0], {
                        text: url,
                        width: 160,
                        height: 160,
                        correctLevel: QRCode.CorrectLevel.M
                    });

                    var $link = $('<a target="_blank" href="' + url + '"></a>');
                    $link.append(_this.$qrcontainter);
                    _this.setElement($link);
                    
                    options.anmgr.notifyEnd();
                });
        } else {
            this.setElement('<a href="#" id="telegram-connect">' +
                'Connect your telegram account Telegram!</a>' +
                '<p>You will be able to save expenses through your phone, ' +
                'even when you are offline.</p>');
        }
    },

    setTelegramAccount: function (account) {
        this.telegramAccount = account;
        return this;
    }
});
