App = Ember.Application.create();

App.Store = DS.Store.extend({
	revision: 12
})



App.Router.map(function() {

})

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return ['red', 'yellow', 'blue'];
  }
})
