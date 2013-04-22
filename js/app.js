App = Ember.Application.create();

App.Router.map(function() {
	this.resource('notes', { path: '/' }, function() {
		this.resource('note', { path: '/notes/:note_id'});

		this.route('new');
		this.route('my_notes');
		this.route('search');
	});
})

App.Store = DS.Store.extend({
	revision: 12,
	adapter: 'DS.FixtureAdapter'
})

App.Note = DS.Model.extend({
	name: DS.attr('string'),
	note: DS.attr('string')
})

App.NotesIndexRoute = Ember.Route.extend({
	model: function() {
		return App.Note.find();
	}
})
