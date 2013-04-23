App = Ember.Application.create();

App.Router.map(function() {
	this.resource('notes', { path: '/' }, function() {
		this.resource('note', { path: '/notes/:note_id' }, function() {
			this.route('edit');
			this.route('delete');
		});
		this.route('new');
	});

	this.resource('tags', function() {
		this.resource('tag', { path: '/:tag_id' });
	});

	this.resource('search');

	this.resource('account', function() {
		this.route('notes');
	});
})

App.Store = DS.Store.extend({
	revision: 12,
	adapter: 'DS.FixtureAdapter'
})

App.Note = DS.Model.extend({
	name: DS.attr('string'),
	note: DS.attr('string'),
	username: DS.attr('string'),
	tags: DS.hasMany('App.Tag')
})

App.Tag = DS.Model.extend({
	name: DS.attr('string'),
	notes: DS.hasMany('App.Note')
})

App.NotesIndexRoute = Ember.Route.extend({
	model: function() {
		return App.Note.find();
	}
})
