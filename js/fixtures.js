App.Note.FIXTURES = [
	{
		id: 1,
		name: "Sub-menu list item width",
		note: "<p>How to solve the issue:</p><pre>li {<br />&nbsp;&nbsp;&nbsp;&nbsp;white-space: nowrap;<br />}</pre>",
		username: "josh",
		tags: [1,2]
	},
	{
		id: 2,
		name: "Another scratchpad note",
		note: "<p>Yet another scratchpad note</p>",
		username: "josh",
		tags: [1]
	},
	{
		id: 3,
		name: "A JavaScript issue",
		note: "<p>Stopping jQuery conflicting</p><pre>jQuery.noConflict();</pre>",
		username: "josh",
		tags: [3]
	},
	{
		id: 4,
		name: "An issue containing everything",
		note: "<p>This is such a generic note it needs all tags</p>",
		username: "josh",
		tags: [1,2,3]
	}
]

App.Tag.FIXTURES = [
	{
		id: 1,
		name: "HTML",
		posts: [1,2,4]
	},
	{
		id: 2,
		name: "CSS",
		posts: [1,4]
	},
	{
		id: 3,
		name: "JavaScript",
		posts: [3,4]
	}
]
