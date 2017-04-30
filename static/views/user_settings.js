var App_View_UserSettings = AbstractView.extend({
	render: function (options) {
		AbstractView.prototype.render.call( this, _.extend( {
				templateObj:{
					username: global.username,
					}
				},
				options
			)
		)
	},

});
