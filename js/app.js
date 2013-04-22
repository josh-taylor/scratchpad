App = Ember.Application.create();

App.Router.map(function() {
	this.resource('notes', { path: '/' });
})

App.Store = DS.Store.extend({
	revision: 12
})

App.Note = DS.Model.extend({
	name: DS.attr('string'),
	content: DS.attr('string')
})

