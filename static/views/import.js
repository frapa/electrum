var App_View_Import = AbstractView.extend({
	
	events: {
		'click #import-button': 'import',
		'click #back-button': 'back'
	},
	
	fromFile: function() {
		console.log('go and import that yourself! (from file)')
	},
	fromService: function() {
		console.log('go and import that yourself! (from a service)')
	},
	import: function() {
		console.log('go and import that yourself!')
	},
	close: function() {
		console.log('close that yourself!')
	},
});
