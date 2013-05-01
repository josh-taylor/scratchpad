App = Ember.Application.createWithMixins({
    rootElement: '#main'
});

App.Router.map(function () {
    this.resource('notes', { path: '/' }, function () {
        this.resource('note', { path: '/notes/:note_id' }, function () {
            this.route('edit');
            this.route('delete');
        });
        this.route('new');
    });

    this.resource('tags', function () {
        this.resource('tag', { path: '/:tag_id' });
    });

    this.resource('search');

    this.resource('account', function () {
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
    votes: DS.attr('number'),
    username: DS.attr('string'),
    tags: DS.hasMany('App.Tag'),
    userHasUpvoted: DS.attr('boolean'),
    userHasDownvoted: DS.attr('boolean'),
    created: DS.attr('date'),

    hasPositiveVoteCount: function () {
        if (this.get('votes') >= 0) {
            return true;
        }
        return false;
    }.property('votes')
})

App.Tag = DS.Model.extend({
    name: DS.attr('string'),
    notes: DS.hasMany('App.Note')
})

App.NotesIndexRoute = Ember.Route.extend({
    model: function () {
        return App.Note.find();
    }
})

App.ApplicationController = Ember.Controller.extend({
    composeView: null,
    isComposeOpen: false,

    openCompose: function () {
        this.set('isComposeOpen', true);

        if (!this.get('composeView')) {
            var view = App.ComposeView.create({ controller: this });
            view.appendTo($('#main'));
            this.set('composeView', view);
        }
    },
    closeCompose: function () {
        var view = this.get('composeView');
        if (view) {
            view.remove();
            this.set('isComposeOpen', false);
            this.set('composeView', null);
        }
    }
})

App.NoteController = Ember.ObjectController.extend({
    canVote: function () {
        if (this.get('userHasUpvoted') || this.get('userHasDownvoted')) {
            return false;
        }
        return true;
    }.property('userHasUpvoted', 'userHasDownvoted'),
    upvote: function () {
        if (this.get('canVote')) {
            this.incrementProperty('votes');
            this.set('userHasUpvoted', true);
            this.get('store').commit();
        }
    },
    downvote: function () {
        if (this.get('canVote')) {
            this.decrementProperty('votes');
            this.set('userHasDownvoted', true);
            this.get('store').commit();
        }
    },

    isEditingName: false,
    toggleEditName: function () {
        this.toggleProperty('isEditingName');
    }
})

App.NoteNameTextField = Ember.TextField.extend({
    didInsertElement: function () {
        this.$().focus();
    },
    focusOut: function (evt) {
        this.set('controller.isEditingName', false);
        this.get('controller.store').commit();
    }
})

App.ComposeView = Ember.View.extend({
    templateName: 'compose',

    didInsertElement: function() {
        $('#main').css('padding-bottom', $('#composer').outerHeight(true));
    },
    willDestroyElement: function() {
        $('#main').css('padding-bottom', 0);
    }
})
