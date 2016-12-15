var App_View_LogIn = AbstractView.extend({
	subviews: {
		username: new Kernel_View_Ui_Entry({
			label: 'username'
		}),
		password: new Kernel_View_Ui_Entry({
			label: 'password'
		})
	},
	
	events: {
		'click #log-in-button': 'login'
	},
	
	login: function() {
		var username = this.subviews.name.getValue();
		var password = this.subviews.password.getValue();
		
		if (!username && !password) {
			this.remove();
		}
	},
});
