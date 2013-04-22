// Version: v1.0.0-rc.2
// Last commit: 656fa6e (2013-03-29 13:40:38 -0700)


(function() {
	/*global __fail__*/

	/**
	 Ember Debug

	 @module ember
	 @submodule ember-debug
	 */

	/**
	 @class Ember
	 */

	if ('undefined' === typeof Ember) {
		Ember = {};

		if ('undefined' !== typeof window) {
			window.Em = window.Ember = Em = Ember;
		}
	}

	Ember.ENV = 'undefined' === typeof ENV ? {} : ENV;

	if (!('MANDATORY_SETTER' in Ember.ENV)) {
		Ember.ENV.MANDATORY_SETTER = true; // default to true for debug dist
	}

	/**
	 Define an assertion that will throw an exception if the condition is not
	 met. Ember build tools will remove any calls to `Ember.assert()` when
	 doing a production build. Example:

	 ```javascript
	 // Test for truthiness
	 Ember.assert('Must pass a valid object', obj);
	 // Fail unconditionally
	 Ember.assert('This code path should never be run')
	 ```

	 @method assert
	 @param {String} desc A description of the assertion. This will become
	 the text of the Error thrown if the assertion fails.
	 @param {Boolean} test Must be truthy for the assertion to pass. If
	 falsy, an exception will be thrown.
	 */
	Ember.assert = function(desc, test) {
		if (!test) throw new Error("assertion failed: "+desc);
	};


	/**
	 Display a warning with the provided message. Ember build tools will
	 remove any calls to `Ember.warn()` when doing a production build.

	 @method warn
	 @param {String} message A warning to display.
	 @param {Boolean} test An optional boolean. If falsy, the warning
	 will be displayed.
	 */
	Ember.warn = function(message, test) {
		if (!test) {
			Ember.Logger.warn("WARNING: "+message);
			if ('trace' in Ember.Logger) Ember.Logger.trace();
		}
	};

	/**
	 Display a debug notice. Ember build tools will remove any calls to
	 `Ember.debug()` when doing a production build.

	 ```javascript
	 Ember.debug("I'm a debug notice!");
	 ```

	 @method debug
	 @param {String} message A debug message to display.
	 */
	Ember.debug = function(message) {
		Ember.Logger.debug("DEBUG: "+message);
	};

	/**
	 Display a deprecation warning with the provided message and a stack trace
	 (Chrome and Firefox only). Ember build tools will remove any calls to
	 `Ember.deprecate()` when doing a production build.

	 @method deprecate
	 @param {String} message A description of the deprecation.
	 @param {Boolean} test An optional boolean. If falsy, the deprecation
	 will be displayed.
	 */
	Ember.deprecate = function(message, test) {
		if (Ember && Ember.TESTING_DEPRECATION) { return; }

		if (arguments.length === 1) { test = false; }
		if (test) { return; }

		if (Ember && Ember.ENV.RAISE_ON_DEPRECATION) { throw new Error(message); }

		var error;

		// When using new Error, we can't do the arguments check for Chrome. Alternatives are welcome
		try { __fail__.fail(); } catch (e) { error = e; }

		if (Ember.LOG_STACKTRACE_ON_DEPRECATION && error.stack) {
			var stack, stackStr = '';
			if (error['arguments']) {
				// Chrome
				stack = error.stack.replace(/^\s+at\s+/gm, '').
					replace(/^([^\(]+?)([\n$])/gm, '{anonymous}($1)$2').
					replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}($1)').split('\n');
				stack.shift();
			} else {
				// Firefox
				stack = error.stack.replace(/(?:\n@:0)?\s+$/m, '').
					replace(/^\(/gm, '{anonymous}(').split('\n');
			}

			stackStr = "\n    " + stack.slice(2).join("\n    ");
			message = message + stackStr;
		}

		Ember.Logger.warn("DEPRECATION: "+message);
	};



	/**
	 Display a deprecation warning with the provided message and a stack trace
	 (Chrome and Firefox only) when the wrapped method is called.

	 Ember build tools will not remove calls to `Ember.deprecateFunc()`, though
	 no warnings will be shown in production.

	 @method deprecateFunc
	 @param {String} message A description of the deprecation.
	 @param {Function} func The function to be deprecated.
	 @return {Function} a new function that wrapped the original function with a deprecation warning
	 */
	Ember.deprecateFunc = function(message, func) {
		return function() {
			Ember.deprecate(message);
			return func.apply(this, arguments);
		};
	};

})();

// Version: v1.0.0-rc.2
// Last commit: 656fa6e (2013-03-29 13:40:38 -0700)


(function() {
	var define, requireModule;

	(function() {
		var registry = {}, seen = {};

		define = function(name, deps, callback) {
			registry[name] = { deps: deps, callback: callback };
		};

		requireModule = function(name) {
			if (seen[name]) { return seen[name]; }
			seen[name] = {};

			var mod = registry[name],
				deps = mod.deps,
				callback = mod.callback,
				reified = [],
				exports;

			for (var i=0, l=deps.length; i<l; i++) {
				if (deps[i] === 'exports') {
					reified.push(exports = {});
				} else {
					reified.push(requireModule(deps[i]));
				}
			}

			var value = callback.apply(this, reified);
			return seen[name] = exports || value;
		};
	})();
	(function() {
		/*globals Em:true ENV */

		/**
		 @module ember
		 @submodule ember-metal
		 */

		/**
		 All Ember methods and functions are defined inside of this namespace. You
		 generally should not add new properties to this namespace as it may be
		 overwritten by future versions of Ember.

		 You can also use the shorthand `Em` instead of `Ember`.

		 Ember-Runtime is a framework that provides core functions for Ember including
		 cross-platform functions, support for property observing and objects. Its
		 focus is on small size and performance. You can use this in place of or
		 along-side other cross-platform libraries such as jQuery.

		 The core Runtime framework is based on the jQuery API with a number of
		 performance optimizations.

		 @class Ember
		 @static
		 @version 1.0.0-rc.2
		 */

		if ('undefined' === typeof Ember) {
			// Create core object. Make it act like an instance of Ember.Namespace so that
			// objects assigned to it are given a sane string representation.
			Ember = {};
		}

// Default imports, exports and lookup to the global object;
		var imports = Ember.imports = Ember.imports || this;
		var exports = Ember.exports = Ember.exports || this;
		var lookup  = Ember.lookup  = Ember.lookup  || this;

// aliases needed to keep minifiers from removing the global context
		exports.Em = exports.Ember = Em = Ember;

// Make sure these are set whether Ember was already defined or not

		Ember.isNamespace = true;

		Ember.toString = function() { return "Ember"; };


		/**
		 @property VERSION
		 @type String
		 @default '1.0.0-rc.2'
		 @final
		 */
		Ember.VERSION = '1.0.0-rc.2';

		/**
		 Standard environmental variables. You can define these in a global `ENV`
		 variable before loading Ember to control various configuration
		 settings.

		 @property ENV
		 @type Hash
		 */
		Ember.ENV = Ember.ENV || ('undefined' === typeof ENV ? {} : ENV);

		Ember.config = Ember.config || {};

// ..........................................................
// BOOTSTRAP
//

		/**
		 Determines whether Ember should enhances some built-in object prototypes to
		 provide a more friendly API. If enabled, a few methods will be added to
		 `Function`, `String`, and `Array`. `Object.prototype` will not be enhanced,
		 which is the one that causes most trouble for people.

		 In general we recommend leaving this option set to true since it rarely
		 conflicts with other code. If you need to turn it off however, you can
		 define an `ENV.EXTEND_PROTOTYPES` config to disable it.

		 @property EXTEND_PROTOTYPES
		 @type Boolean
		 @default true
		 */
		Ember.EXTEND_PROTOTYPES = Ember.ENV.EXTEND_PROTOTYPES;

		if (typeof Ember.EXTEND_PROTOTYPES === 'undefined') {
			Ember.EXTEND_PROTOTYPES = true;
		}

		/**
		 Determines whether Ember logs a full stack trace during deprecation warnings

		 @property LOG_STACKTRACE_ON_DEPRECATION
		 @type Boolean
		 @default true
		 */
		Ember.LOG_STACKTRACE_ON_DEPRECATION = (Ember.ENV.LOG_STACKTRACE_ON_DEPRECATION !== false);

		/**
		 Determines whether Ember should add ECMAScript 5 shims to older browsers.

		 @property SHIM_ES5
		 @type Boolean
		 @default Ember.EXTEND_PROTOTYPES
		 */
		Ember.SHIM_ES5 = (Ember.ENV.SHIM_ES5 === false) ? false : Ember.EXTEND_PROTOTYPES;

		/**
		 Determines whether Ember logs info about version of used libraries

		 @property LOG_VERSION
		 @type Boolean
		 @default true
		 */
		Ember.LOG_VERSION = (Ember.ENV.LOG_VERSION === false) ? false : true;

		/**
		 Empty function. Useful for some operations.

		 @method K
		 @private
		 @return {Object}
		 */
		Ember.K = function() { return this; };


// Stub out the methods defined by the ember-debug package in case it's not loaded

		if ('undefined' === typeof Ember.assert) { Ember.assert = Ember.K; }
		if ('undefined' === typeof Ember.warn) { Ember.warn = Ember.K; }
		if ('undefined' === typeof Ember.debug) { Ember.debug = Ember.K; }
		if ('undefined' === typeof Ember.deprecate) { Ember.deprecate = Ember.K; }
		if ('undefined' === typeof Ember.deprecateFunc) {
			Ember.deprecateFunc = function(_, func) { return func; };
		}

		/**
		 Previously we used `Ember.$.uuid`, however `$.uuid` has been removed from
		 jQuery master. We'll just bootstrap our own uuid now.

		 @property uuid
		 @type Number
		 @private
		 */
		Ember.uuid = 0;

// ..........................................................
// LOGGER
//

		function consoleMethod(name) {
			if (imports.console && imports.console[name]) {
				// Older IE doesn't support apply, but Chrome needs it
				if (imports.console[name].apply) {
					return function() {
						imports.console[name].apply(imports.console, arguments);
					};
				} else {
					return function() {
						var message = Array.prototype.join.call(arguments, ', ');
						imports.console[name](message);
					};
				}
			}
		}

		/**
		 Inside Ember-Metal, simply uses the methods from `imports.console`.
		 Override this to provide more robust logging functionality.

		 @class Logger
		 @namespace Ember
		 */
		Ember.Logger = {
			log:   consoleMethod('log')   || Ember.K,
			warn:  consoleMethod('warn')  || Ember.K,
			error: consoleMethod('error') || Ember.K,
			info:  consoleMethod('info')  || Ember.K,
			debug: consoleMethod('debug') || consoleMethod('info') || Ember.K
		};


// ..........................................................
// ERROR HANDLING
//

		/**
		 A function may be assigned to `Ember.onerror` to be called when Ember
		 internals encounter an error. This is useful for specialized error handling
		 and reporting code.

		 @event onerror
		 @for Ember
		 @param {Exception} error the error object
		 */
		Ember.onerror = null;

		/**
		 @private

		 Wrap code block in a try/catch if {{#crossLink "Ember/onerror"}}{{/crossLink}} is set.

		 @method handleErrors
		 @for Ember
		 @param {Function} func
		 @param [context]
		 */
		Ember.handleErrors = function(func, context) {
			// Unfortunately in some browsers we lose the backtrace if we rethrow the existing error,
			// so in the event that we don't have an `onerror` handler we don't wrap in a try/catch
			if ('function' === typeof Ember.onerror) {
				try {
					return func.call(context || this);
				} catch (error) {
					Ember.onerror(error);
				}
			} else {
				return func.call(context || this);
			}
		};

		Ember.merge = function(original, updates) {
			for (var prop in updates) {
				if (!updates.hasOwnProperty(prop)) { continue; }
				original[prop] = updates[prop];
			}
			return original;
		};

		/**
		 Returns true if the passed value is null or undefined. This avoids errors
		 from JSLint complaining about use of ==, which can be technically
		 confusing.

		 ```javascript
		 Ember.isNone();              // true
		 Ember.isNone(null);          // true
		 Ember.isNone(undefined);     // true
		 Ember.isNone('');            // false
		 Ember.isNone([]);            // false
		 Ember.isNone(function(){});  // false
		 ```

		 @method isNone
		 @for Ember
		 @param {Object} obj Value to test
		 @return {Boolean}
		 */
		Ember.isNone = function(obj) {
			return obj === null || obj === undefined;
		};
		Ember.none = Ember.deprecateFunc("Ember.none is deprecated. Please use Ember.isNone instead.", Ember.isNone);

		/**
		 Verifies that a value is `null` or an empty string, empty array,
		 or empty function.

		 Constrains the rules on `Ember.isNone` by returning false for empty
		 string and empty arrays.

		 ```javascript
		 Ember.isEmpty();                // true
		 Ember.isEmpty(null);            // true
		 Ember.isEmpty(undefined);       // true
		 Ember.isEmpty('');              // true
		 Ember.isEmpty([]);              // true
		 Ember.isEmpty('Adam Hawkins');  // false
		 Ember.isEmpty([0,1,2]);         // false
		 ```

		 @method isEmpty
		 @for Ember
		 @param {Object} obj Value to test
		 @return {Boolean}
		 */
		Ember.isEmpty = function(obj) {
			return obj === null || obj === undefined || (obj.length === 0 && typeof obj !== 'function') || (typeof obj === 'object' && Ember.get(obj, 'length') === 0);
		};
		Ember.empty = Ember.deprecateFunc("Ember.empty is deprecated. Please use Ember.isEmpty instead.", Ember.isEmpty) ;


	})();



	(function() {
		/*globals Node */
		/**
		 @module ember-metal
		 */

		/**
		 Platform specific methods and feature detectors needed by the framework.

		 @class platform
		 @namespace Ember
		 @static
		 */
		var platform = Ember.platform = {};


		/**
		 Identical to `Object.create()`. Implements if not available natively.

		 @method create
		 @for Ember
		 */
		Ember.create = Object.create;

// STUB_OBJECT_CREATE allows us to override other libraries that stub
// Object.create different than we would prefer
		if (!Ember.create || Ember.ENV.STUB_OBJECT_CREATE) {
			var K = function() {};

			Ember.create = function(obj, props) {
				K.prototype = obj;
				obj = new K();
				if (props) {
					K.prototype = obj;
					for (var prop in props) {
						K.prototype[prop] = props[prop].value;
					}
					obj = new K();
				}
				K.prototype = null;

				return obj;
			};

			Ember.create.isSimulated = true;
		}

		var defineProperty = Object.defineProperty;
		var canRedefineProperties, canDefinePropertyOnDOM;

// Catch IE8 where Object.defineProperty exists but only works on DOM elements
		if (defineProperty) {
			try {
				defineProperty({}, 'a',{get:function(){}});
			} catch (e) {
				defineProperty = null;
			}
		}

		if (defineProperty) {
			// Detects a bug in Android <3.2 where you cannot redefine a property using
			// Object.defineProperty once accessors have already been set.
			canRedefineProperties = (function() {
				var obj = {};

				defineProperty(obj, 'a', {
					configurable: true,
					enumerable: true,
					get: function() { },
					set: function() { }
				});

				defineProperty(obj, 'a', {
					configurable: true,
					enumerable: true,
					writable: true,
					value: true
				});

				return obj.a === true;
			})();

			// This is for Safari 5.0, which supports Object.defineProperty, but not
			// on DOM nodes.
			canDefinePropertyOnDOM = (function(){
				try {
					defineProperty(document.createElement('div'), 'definePropertyOnDOM', {});
					return true;
				} catch(e) { }

				return false;
			})();

			if (!canRedefineProperties) {
				defineProperty = null;
			} else if (!canDefinePropertyOnDOM) {
				defineProperty = function(obj, keyName, desc){
					var isNode;

					if (typeof Node === "object") {
						isNode = obj instanceof Node;
					} else {
						isNode = typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName === "string";
					}

					if (isNode) {
						// TODO: Should we have a warning here?
						return (obj[keyName] = desc.value);
					} else {
						return Object.defineProperty(obj, keyName, desc);
					}
				};
			}
		}

		/**
		 @class platform
		 @namespace Ember
		 */

		/**
		 Identical to `Object.defineProperty()`. Implements as much functionality
		 as possible if not available natively.

		 @method defineProperty
		 @param {Object} obj The object to modify
		 @param {String} keyName property name to modify
		 @param {Object} desc descriptor hash
		 @return {void}
		 */
		platform.defineProperty = defineProperty;

		/**
		 Set to true if the platform supports native getters and setters.

		 @property hasPropertyAccessors
		 @final
		 */
		platform.hasPropertyAccessors = true;

		if (!platform.defineProperty) {
			platform.hasPropertyAccessors = false;

			platform.defineProperty = function(obj, keyName, desc) {
				if (!desc.get) { obj[keyName] = desc.value; }
			};

			platform.defineProperty.isSimulated = true;
		}

		if (Ember.ENV.MANDATORY_SETTER && !platform.hasPropertyAccessors) {
			Ember.ENV.MANDATORY_SETTER = false;
		}

	})();



	(function() {
		/**
		 @module ember-metal
		 */


		var o_defineProperty = Ember.platform.defineProperty,
			o_create = Ember.create,
		// Used for guid generation...
			GUID_KEY = '__ember'+ (+ new Date()),
			uuid         = 0,
			numberCache  = [],
			stringCache  = {};

		var MANDATORY_SETTER = Ember.ENV.MANDATORY_SETTER;

		/**
		 @private

		 A unique key used to assign guids and other private metadata to objects.
		 If you inspect an object in your browser debugger you will often see these.
		 They can be safely ignored.

		 On browsers that support it, these properties are added with enumeration
		 disabled so they won't show up when you iterate over your properties.

		 @property GUID_KEY
		 @for Ember
		 @type String
		 @final
		 */
		Ember.GUID_KEY = GUID_KEY;

		var GUID_DESC = {
			writable:    false,
			configurable: false,
			enumerable:  false,
			value: null
		};

		/**
		 @private

		 Generates a new guid, optionally saving the guid to the object that you
		 pass in. You will rarely need to use this method. Instead you should
		 call `Ember.guidFor(obj)`, which return an existing guid if available.

		 @method generateGuid
		 @for Ember
		 @param {Object} [obj] Object the guid will be used for. If passed in, the guid will
		 be saved on the object and reused whenever you pass the same object
		 again.

		 If no object is passed, just generate a new guid.
		 @param {String} [prefix] Prefix to place in front of the guid. Useful when you want to
		 separate the guid into separate namespaces.
		 @return {String} the guid
		 */
		Ember.generateGuid = function generateGuid(obj, prefix) {
			if (!prefix) prefix = 'ember';
			var ret = (prefix + (uuid++));
			if (obj) {
				GUID_DESC.value = ret;
				o_defineProperty(obj, GUID_KEY, GUID_DESC);
			}
			return ret ;
		};

		/**
		 @private

		 Returns a unique id for the object. If the object does not yet have a guid,
		 one will be assigned to it. You can call this on any object,
		 `Ember.Object`-based or not, but be aware that it will add a `_guid`
		 property.

		 You can also use this method on DOM Element objects.

		 @method guidFor
		 @for Ember
		 @param {Object} obj any object, string, number, Element, or primitive
		 @return {String} the unique guid for this instance.
		 */
		Ember.guidFor = function guidFor(obj) {

			// special cases where we don't want to add a key to object
			if (obj === undefined) return "(undefined)";
			if (obj === null) return "(null)";

			var cache, ret;
			var type = typeof obj;

			// Don't allow prototype changes to String etc. to change the guidFor
			switch(type) {
				case 'number':
					ret = numberCache[obj];
					if (!ret) ret = numberCache[obj] = 'nu'+obj;
					return ret;

				case 'string':
					ret = stringCache[obj];
					if (!ret) ret = stringCache[obj] = 'st'+(uuid++);
					return ret;

				case 'boolean':
					return obj ? '(true)' : '(false)';

				default:
					if (obj[GUID_KEY]) return obj[GUID_KEY];
					if (obj === Object) return '(Object)';
					if (obj === Array)  return '(Array)';
					ret = 'ember'+(uuid++);
					GUID_DESC.value = ret;
					o_defineProperty(obj, GUID_KEY, GUID_DESC);
					return ret;
			}
		};

// ..........................................................
// META
//

		var META_DESC = {
			writable:    true,
			configurable: false,
			enumerable:  false,
			value: null
		};

		var META_KEY = Ember.GUID_KEY+'_meta';

		/**
		 The key used to store meta information on object for property observing.

		 @property META_KEY
		 @for Ember
		 @private
		 @final
		 @type String
		 */
		Ember.META_KEY = META_KEY;

// Placeholder for non-writable metas.
		var EMPTY_META = {
			descs: {},
			watching: {}
		};

		if (MANDATORY_SETTER) { EMPTY_META.values = {}; }

		Ember.EMPTY_META = EMPTY_META;

		if (Object.freeze) Object.freeze(EMPTY_META);

		var isDefinePropertySimulated = Ember.platform.defineProperty.isSimulated;

		function Meta(obj) {
			this.descs = {};
			this.watching = {};
			this.cache = {};
			this.source = obj;
		}

		if (isDefinePropertySimulated) {
			// on platforms that don't support enumerable false
			// make meta fail jQuery.isPlainObject() to hide from
			// jQuery.extend() by having a property that fails
			// hasOwnProperty check.
			Meta.prototype.__preventPlainObject__ = true;

			// Without non-enumerable properties, meta objects will be output in JSON
			// unless explicitly suppressed
			Meta.prototype.toJSON = function () { };
		}

		/**
		 Retrieves the meta hash for an object. If `writable` is true ensures the
		 hash is writable for this object as well.

		 The meta object contains information about computed property descriptors as
		 well as any watched properties and other information. You generally will
		 not access this information directly but instead work with higher level
		 methods that manipulate this hash indirectly.

		 @method meta
		 @for Ember
		 @private

		 @param {Object} obj The object to retrieve meta for
		 @param {Boolean} [writable=true] Pass `false` if you do not intend to modify
		 the meta hash, allowing the method to avoid making an unnecessary copy.
		 @return {Object} the meta hash for an object
		 */
		Ember.meta = function meta(obj, writable) {

			var ret = obj[META_KEY];
			if (writable===false) return ret || EMPTY_META;

			if (!ret) {
				if (!isDefinePropertySimulated) o_defineProperty(obj, META_KEY, META_DESC);

				ret = new Meta(obj);

				if (MANDATORY_SETTER) { ret.values = {}; }

				obj[META_KEY] = ret;

				// make sure we don't accidentally try to create constructor like desc
				ret.descs.constructor = null;

			} else if (ret.source !== obj) {
				if (!isDefinePropertySimulated) o_defineProperty(obj, META_KEY, META_DESC);

				ret = o_create(ret);
				ret.descs    = o_create(ret.descs);
				ret.watching = o_create(ret.watching);
				ret.cache    = {};
				ret.source   = obj;

				if (MANDATORY_SETTER) { ret.values = o_create(ret.values); }

				obj[META_KEY] = ret;
			}
			return ret;
		};

		Ember.getMeta = function getMeta(obj, property) {
			var meta = Ember.meta(obj, false);
			return meta[property];
		};

		Ember.setMeta = function setMeta(obj, property, value) {
			var meta = Ember.meta(obj, true);
			meta[property] = value;
			return value;
		};

		/**
		 @private

		 In order to store defaults for a class, a prototype may need to create
		 a default meta object, which will be inherited by any objects instantiated
		 from the class's constructor.

		 However, the properties of that meta object are only shallow-cloned,
		 so if a property is a hash (like the event system's `listeners` hash),
		 it will by default be shared across all instances of that class.

		 This method allows extensions to deeply clone a series of nested hashes or
		 other complex objects. For instance, the event system might pass
		 `['listeners', 'foo:change', 'ember157']` to `prepareMetaPath`, which will
		 walk down the keys provided.

		 For each key, if the key does not exist, it is created. If it already
		 exists and it was inherited from its constructor, the constructor's
		 key is cloned.

		 You can also pass false for `writable`, which will simply return
		 undefined if `prepareMetaPath` discovers any part of the path that
		 shared or undefined.

		 @method metaPath
		 @for Ember
		 @param {Object} obj The object whose meta we are examining
		 @param {Array} path An array of keys to walk down
		 @param {Boolean} writable whether or not to create a new meta
		 (or meta property) if one does not already exist or if it's
		 shared with its constructor
		 */
		Ember.metaPath = function metaPath(obj, path, writable) {
			var meta = Ember.meta(obj, writable), keyName, value;

			for (var i=0, l=path.length; i<l; i++) {
				keyName = path[i];
				value = meta[keyName];

				if (!value) {
					if (!writable) { return undefined; }
					value = meta[keyName] = { __ember_source__: obj };
				} else if (value.__ember_source__ !== obj) {
					if (!writable) { return undefined; }
					value = meta[keyName] = o_create(value);
					value.__ember_source__ = obj;
				}

				meta = value;
			}

			return value;
		};

		/**
		 @private

		 Wraps the passed function so that `this._super` will point to the superFunc
		 when the function is invoked. This is the primitive we use to implement
		 calls to super.

		 @method wrap
		 @for Ember
		 @param {Function} func The function to call
		 @param {Function} superFunc The super function.
		 @return {Function} wrapped function.
		 */
		Ember.wrap = function(func, superFunc) {
			function K() {}

			function superWrapper() {
				var ret, sup = this._super;
				this._super = superFunc || K;
				ret = func.apply(this, arguments);
				this._super = sup;
				return ret;
			}

			superWrapper.wrappedFunction = func;
			superWrapper.__ember_observes__ = func.__ember_observes__;
			superWrapper.__ember_observesBefore__ = func.__ember_observesBefore__;

			return superWrapper;
		};

		/**
		 Returns true if the passed object is an array or Array-like.

		 Ember Array Protocol:

		 - the object has an objectAt property
		 - the object is a native Array
		 - the object is an Object, and has a length property

		 Unlike `Ember.typeOf` this method returns true even if the passed object is
		 not formally array but appears to be array-like (i.e. implements `Ember.Array`)

		 ```javascript
		 Ember.isArray();                                            // false
		 Ember.isArray([]);                                          // true
		 Ember.isArray( Ember.ArrayProxy.create({ content: [] }) );  // true
		 ```

		 @method isArray
		 @for Ember
		 @param {Object} obj The object to test
		 @return {Boolean} true if the passed object is an array or Array-like
		 */
		Ember.isArray = function(obj) {
			if (!obj || obj.setInterval) { return false; }
			if (Array.isArray && Array.isArray(obj)) { return true; }
			if (Ember.Array && Ember.Array.detect(obj)) { return true; }
			if ((obj.length !== undefined) && 'object'===typeof obj) { return true; }
			return false;
		};

		/**
		 Forces the passed object to be part of an array. If the object is already
		 an array or array-like, returns the object. Otherwise adds the object to
		 an array. If obj is `null` or `undefined`, returns an empty array.

		 ```javascript
		 Ember.makeArray();                           // []
		 Ember.makeArray(null);                       // []
		 Ember.makeArray(undefined);                  // []
		 Ember.makeArray('lindsay');                  // ['lindsay']
		 Ember.makeArray([1,2,42]);                   // [1,2,42]

		 var controller = Ember.ArrayProxy.create({ content: [] });
		 Ember.makeArray(controller) === controller;  // true
		 ```

		 @method makeArray
		 @for Ember
		 @param {Object} obj the object
		 @return {Array}
		 */
		Ember.makeArray = function(obj) {
			if (obj === null || obj === undefined) { return []; }
			return Ember.isArray(obj) ? obj : [obj];
		};

		function canInvoke(obj, methodName) {
			return !!(obj && typeof obj[methodName] === 'function');
		}

		/**
		 Checks to see if the `methodName` exists on the `obj`.

		 @method canInvoke
		 @for Ember
		 @param {Object} obj The object to check for the method
		 @param {String} methodName The method name to check for
		 */
		Ember.canInvoke = canInvoke;

		/**
		 Checks to see if the `methodName` exists on the `obj`,
		 and if it does, invokes it with the arguments passed.

		 @method tryInvoke
		 @for Ember
		 @param {Object} obj The object to check for the method
		 @param {String} methodName The method name to check for
		 @param {Array} [args] The arguments to pass to the method
		 @return {anything} the return value of the invoked method or undefined if it cannot be invoked
		 */
		Ember.tryInvoke = function(obj, methodName, args) {
			if (canInvoke(obj, methodName)) {
				return obj[methodName].apply(obj, args || []);
			}
		};

// https://github.com/emberjs/ember.js/pull/1617
		var needsFinallyFix = (function() {
			var count = 0;
			try{
				try { }
				finally {
					count++;
					throw new Error('needsFinallyFixTest');
				}
			} catch (e) {}

			return count !== 1;
		})();

		/**
		 Provides try { } finally { } functionality, while working
		 around Safari's double finally bug.

		 @method tryFinally
		 @for Ember
		 @param {Function} tryable The function to run the try callback
		 @param {Function} finalizer The function to run the finally callback
		 @param [binding]
		 @return {anything} The return value is the that of the finalizer,
		 unless that valueis undefined, in which case it is the return value
		 of the tryable
		 */

		if (needsFinallyFix) {
			Ember.tryFinally = function(tryable, finalizer, binding) {
				var result, finalResult, finalError;

				binding = binding || this;

				try {
					result = tryable.call(binding);
				} finally {
					try {
						finalResult = finalizer.call(binding);
					} catch (e){
						finalError = e;
					}
				}

				if (finalError) { throw finalError; }

				return (finalResult === undefined) ? result : finalResult;
			};
		} else {
			Ember.tryFinally = function(tryable, finalizer, binding) {
				var result, finalResult;

				binding = binding || this;

				try {
					result = tryable.call(binding);
				} finally {
					finalResult = finalizer.call(binding);
				}

				return (finalResult === undefined) ? result : finalResult;
			};
		}

		/**
		 Provides try { } catch finally { } functionality, while working
		 around Safari's double finally bug.

		 @method tryCatchFinally
		 @for Ember
		 @param {Function} tryable The function to run the try callback
		 @param {Function} catchable The function to run the catchable callback
		 @param {Function} finalizer The function to run the finally callback
		 @param [binding]
		 @return {anything} The return value is the that of the finalizer,
		 unless that value is undefined, in which case it is the return value
		 of the tryable.
		 */
		if (needsFinallyFix) {
			Ember.tryCatchFinally = function(tryable, catchable, finalizer, binding) {
				var result, finalResult, finalError, finalReturn;

				binding = binding || this;

				try {
					result = tryable.call(binding);
				} catch(error) {
					result = catchable.call(binding, error);
				} finally {
					try {
						finalResult = finalizer.call(binding);
					} catch (e){
						finalError = e;
					}
				}

				if (finalError) { throw finalError; }

				return (finalResult === undefined) ? result : finalResult;
			};
		} else {
			Ember.tryCatchFinally = function(tryable, catchable, finalizer, binding) {
				var result, finalResult;

				binding = binding || this;

				try {
					result = tryable.call(binding);
				} catch(error) {
					result = catchable.call(binding, error);
				} finally {
					finalResult = finalizer.call(binding);
				}

				return (finalResult === undefined) ? result : finalResult;
			};
		}

	})();



	(function() {
// Ember.tryCatchFinally

		/**
		 The purpose of the Ember Instrumentation module is
		 to provide efficient, general-purpose instrumentation
		 for Ember.

		 Subscribe to a listener by using `Ember.subscribe`:

		 ```javascript
		 Ember.subscribe("render", {
    before: function(name, timestamp, payload) {

    },

    after: function(name, timestamp, payload) {

    }
  });
		 ```

		 If you return a value from the `before` callback, that same
		 value will be passed as a fourth parameter to the `after`
		 callback.

		 Instrument a block of code by using `Ember.instrument`:

		 ```javascript
		 Ember.instrument("render.handlebars", payload, function() {
    // rendering logic
  }, binding);
		 ```

		 Event names passed to `Ember.instrument` are namespaced
		 by periods, from more general to more specific. Subscribers
		 can listen for events by whatever level of granularity they
		 are interested in.

		 In the above example, the event is `render.handlebars`,
		 and the subscriber listened for all events beginning with
		 `render`. It would receive callbacks for events named
		 `render`, `render.handlebars`, `render.container`, or
		 even `render.handlebars.layout`.

		 @class Instrumentation
		 @namespace Ember
		 @static
		 */
		Ember.Instrumentation = {};

		var subscribers = [], cache = {};

		var populateListeners = function(name) {
			var listeners = [], subscriber;

			for (var i=0, l=subscribers.length; i<l; i++) {
				subscriber = subscribers[i];
				if (subscriber.regex.test(name)) {
					listeners.push(subscriber.object);
				}
			}

			cache[name] = listeners;
			return listeners;
		};

		var time = (function() {
			var perf = 'undefined' !== typeof window ? window.performance || {} : {};
			var fn = perf.now || perf.mozNow || perf.webkitNow || perf.msNow || perf.oNow;
			// fn.bind will be available in all the browsers that support the advanced window.performance... ;-)
			return fn ? fn.bind(perf) : function() { return +new Date(); };
		})();


		Ember.Instrumentation.instrument = function(name, payload, callback, binding) {
			var listeners = cache[name], timeName, ret;

			if (Ember.STRUCTURED_PROFILE) {
				timeName = name + ": " + payload.object;
				console.time(timeName);
			}

			if (!listeners) {
				listeners = populateListeners(name);
			}

			if (listeners.length === 0) {
				ret = callback.call(binding);
				if (Ember.STRUCTURED_PROFILE) { console.timeEnd(timeName); }
				return ret;
			}

			var beforeValues = [], listener, i, l;

			function tryable(){
				for (i=0, l=listeners.length; i<l; i++) {
					listener = listeners[i];
					beforeValues[i] = listener.before(name, time(), payload);
				}

				return callback.call(binding);
			}

			function catchable(e){
				payload = payload || {};
				payload.exception = e;
			}

			function finalizer() {
				for (i=0, l=listeners.length; i<l; i++) {
					listener = listeners[i];
					listener.after(name, time(), payload, beforeValues[i]);
				}

				if (Ember.STRUCTURED_PROFILE) {
					console.timeEnd(timeName);
				}
			}

			return Ember.tryCatchFinally(tryable, catchable, finalizer);
		};

		Ember.Instrumentation.subscribe = function(pattern, object) {
			var paths = pattern.split("."), path, regex = [];

			for (var i=0, l=paths.length; i<l; i++) {
				path = paths[i];
				if (path === "*") {
					regex.push("[^\\.]*");
				} else {
					regex.push(path);
				}
			}

			regex = regex.join("\\.");
			regex = regex + "(\\..*)?";

			var subscriber = {
				pattern: pattern,
				regex: new RegExp("^" + regex + "$"),
				object: object
			};

			subscribers.push(subscriber);
			cache = {};

			return subscriber;
		};

		Ember.Instrumentation.unsubscribe = function(subscriber) {
			var index;

			for (var i=0, l=subscribers.length; i<l; i++) {
				if (subscribers[i] === subscriber) {
					index = i;
				}
			}

			subscribers.splice(index, 1);
			cache = {};
		};

		Ember.Instrumentation.reset = function() {
			subscribers = [];
			cache = {};
		};

		Ember.instrument = Ember.Instrumentation.instrument;
		Ember.subscribe = Ember.Instrumentation.subscribe;

	})();



	(function() {
		var utils = Ember.EnumerableUtils = {
			map: function(obj, callback, thisArg) {
				return obj.map ? obj.map.call(obj, callback, thisArg) : Array.prototype.map.call(obj, callback, thisArg);
			},

			forEach: function(obj, callback, thisArg) {
				return obj.forEach ? obj.forEach.call(obj, callback, thisArg) : Array.prototype.forEach.call(obj, callback, thisArg);
			},

			indexOf: function(obj, element, index) {
				return obj.indexOf ? obj.indexOf.call(obj, element, index) : Array.prototype.indexOf.call(obj, element, index);
			},

			indexesOf: function(obj, elements) {
				return elements === undefined ? [] : utils.map(elements, function(item) {
					return utils.indexOf(obj, item);
				});
			},

			addObject: function(array, item) {
				var index = utils.indexOf(array, item);
				if (index === -1) { array.push(item); }
			},

			removeObject: function(array, item) {
				var index = utils.indexOf(array, item);
				if (index !== -1) { array.splice(index, 1); }
			},

			replace: function(array, idx, amt, objects) {
				if (array.replace) {
					return array.replace(idx, amt, objects);
				} else {
					var args = Array.prototype.concat.apply([idx, amt], objects);
					return array.splice.apply(array, args);
				}
			},

			intersection: function(array1, array2) {
				var intersection = [];

				array1.forEach(function(element) {
					if (array2.indexOf(element) >= 0) {
						intersection.push(element);
					}
				});

				return intersection;
			}
		};

	})();



	(function() {
		/*jshint newcap:false*/
		/**
		 @module ember-metal
		 */

// NOTE: There is a bug in jshint that doesn't recognize `Object()` without `new`
// as being ok unless both `newcap:false` and not `use strict`.
// https://github.com/jshint/jshint/issues/392

// Testing this is not ideal, but we want to use native functions
// if available, but not to use versions created by libraries like Prototype
		var isNativeFunc = function(func) {
			// This should probably work in all browsers likely to have ES5 array methods
			return func && Function.prototype.toString.call(func).indexOf('[native code]') > -1;
		};

// From: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/map
		var arrayMap = isNativeFunc(Array.prototype.map) ? Array.prototype.map : function(fun /*, thisp */) {
			//"use strict";

			if (this === void 0 || this === null) {
				throw new TypeError();
			}

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function") {
				throw new TypeError();
			}

			var res = new Array(len);
			var thisp = arguments[1];
			for (var i = 0; i < len; i++) {
				if (i in t) {
					res[i] = fun.call(thisp, t[i], i, t);
				}
			}

			return res;
		};

// From: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/foreach
		var arrayForEach = isNativeFunc(Array.prototype.forEach) ? Array.prototype.forEach : function(fun /*, thisp */) {
			//"use strict";

			if (this === void 0 || this === null) {
				throw new TypeError();
			}

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function") {
				throw new TypeError();
			}

			var thisp = arguments[1];
			for (var i = 0; i < len; i++) {
				if (i in t) {
					fun.call(thisp, t[i], i, t);
				}
			}
		};

		var arrayIndexOf = isNativeFunc(Array.prototype.indexOf) ? Array.prototype.indexOf : function (obj, fromIndex) {
			if (fromIndex === null || fromIndex === undefined) { fromIndex = 0; }
			else if (fromIndex < 0) { fromIndex = Math.max(0, this.length + fromIndex); }
			for (var i = fromIndex, j = this.length; i < j; i++) {
				if (this[i] === obj) { return i; }
			}
			return -1;
		};

		Ember.ArrayPolyfills = {
			map: arrayMap,
			forEach: arrayForEach,
			indexOf: arrayIndexOf
		};

		if (Ember.SHIM_ES5) {
			if (!Array.prototype.map) {
				Array.prototype.map = arrayMap;
			}

			if (!Array.prototype.forEach) {
				Array.prototype.forEach = arrayForEach;
			}

			if (!Array.prototype.indexOf) {
				Array.prototype.indexOf = arrayIndexOf;
			}
		}

	})();



	(function() {
		/**
		 @module ember-metal
		 */

		/*
		 JavaScript (before ES6) does not have a Map implementation. Objects,
		 which are often used as dictionaries, may only have Strings as keys.

		 Because Ember has a way to get a unique identifier for every object
		 via `Ember.guidFor`, we can implement a performant Map with arbitrary
		 keys. Because it is commonly used in low-level bookkeeping, Map is
		 implemented as a pure JavaScript object for performance.

		 This implementation follows the current iteration of the ES6 proposal for
		 maps (http://wiki.ecmascript.org/doku.php?id=harmony:simple_maps_and_sets),
		 with two exceptions. First, because we need our implementation to be pleasant
		 on older browsers, we do not use the `delete` name (using `remove` instead).
		 Second, as we do not have the luxury of in-VM iteration, we implement a
		 forEach method for iteration.

		 Map is mocked out to look like an Ember object, so you can do
		 `Ember.Map.create()` for symmetry with other Ember classes.
		 */
		var guidFor = Ember.guidFor,
			indexOf = Ember.ArrayPolyfills.indexOf;

		var copy = function(obj) {
			var output = {};

			for (var prop in obj) {
				if (obj.hasOwnProperty(prop)) { output[prop] = obj[prop]; }
			}

			return output;
		};

		var copyMap = function(original, newObject) {
			var keys = original.keys.copy(),
				values = copy(original.values);

			newObject.keys = keys;
			newObject.values = values;

			return newObject;
		};

		/**
		 This class is used internally by Ember and Ember Data.
		 Please do not use it at this time. We plan to clean it up
		 and add many tests soon.

		 @class OrderedSet
		 @namespace Ember
		 @constructor
		 @private
		 */
		var OrderedSet = Ember.OrderedSet = function() {
			this.clear();
		};

		/**
		 @method create
		 @static
		 @return {Ember.OrderedSet}
		 */
		OrderedSet.create = function() {
			return new OrderedSet();
		};


		OrderedSet.prototype = {
			/**
			 @method clear
			 */
			clear: function() {
				this.presenceSet = {};
				this.list = [];
			},

			/**
			 @method add
			 @param obj
			 */
			add: function(obj) {
				var guid = guidFor(obj),
					presenceSet = this.presenceSet,
					list = this.list;

				if (guid in presenceSet) { return; }

				presenceSet[guid] = true;
				list.push(obj);
			},

			/**
			 @method remove
			 @param obj
			 */
			remove: function(obj) {
				var guid = guidFor(obj),
					presenceSet = this.presenceSet,
					list = this.list;

				delete presenceSet[guid];

				var index = indexOf.call(list, obj);
				if (index > -1) {
					list.splice(index, 1);
				}
			},

			/**
			 @method isEmpty
			 @return {Boolean}
			 */
			isEmpty: function() {
				return this.list.length === 0;
			},

			/**
			 @method has
			 @param obj
			 @return {Boolean}
			 */
			has: function(obj) {
				var guid = guidFor(obj),
					presenceSet = this.presenceSet;

				return guid in presenceSet;
			},

			/**
			 @method forEach
			 @param {Function} fn
			 @param self
			 */
			forEach: function(fn, self) {
				// allow mutation during iteration
				var list = this.list.slice();

				for (var i = 0, j = list.length; i < j; i++) {
					fn.call(self, list[i]);
				}
			},

			/**
			 @method toArray
			 @return {Array}
			 */
			toArray: function() {
				return this.list.slice();
			},

			/**
			 @method copy
			 @return {Ember.OrderedSet}
			 */
			copy: function() {
				var set = new OrderedSet();

				set.presenceSet = copy(this.presenceSet);
				set.list = this.list.slice();

				return set;
			}
		};

		/**
		 A Map stores values indexed by keys. Unlike JavaScript's
		 default Objects, the keys of a Map can be any JavaScript
		 object.

		 Internally, a Map has two data structures:

		 1. `keys`: an OrderedSet of all of the existing keys
		 2. `values`: a JavaScript Object indexed by the `Ember.guidFor(key)`

		 When a key/value pair is added for the first time, we
		 add the key to the `keys` OrderedSet, and create or
		 replace an entry in `values`. When an entry is deleted,
		 we delete its entry in `keys` and `values`.

		 @class Map
		 @namespace Ember
		 @private
		 @constructor
		 */
		var Map = Ember.Map = function() {
			this.keys = Ember.OrderedSet.create();
			this.values = {};
		};

		/**
		 @method create
		 @static
		 */
		Map.create = function() {
			return new Map();
		};

		Map.prototype = {
			/**
			 Retrieve the value associated with a given key.

			 @method get
			 @param {anything} key
			 @return {anything} the value associated with the key, or `undefined`
			 */
			get: function(key) {
				var values = this.values,
					guid = guidFor(key);

				return values[guid];
			},

			/**
			 Adds a value to the map. If a value for the given key has already been
			 provided, the new value will replace the old value.

			 @method set
			 @param {anything} key
			 @param {anything} value
			 */
			set: function(key, value) {
				var keys = this.keys,
					values = this.values,
					guid = guidFor(key);

				keys.add(key);
				values[guid] = value;
			},

			/**
			 Removes a value from the map for an associated key.

			 @method remove
			 @param {anything} key
			 @return {Boolean} true if an item was removed, false otherwise
			 */
			remove: function(key) {
				// don't use ES6 "delete" because it will be annoying
				// to use in browsers that are not ES6 friendly;
				var keys = this.keys,
					values = this.values,
					guid = guidFor(key),
					value;

				if (values.hasOwnProperty(guid)) {
					keys.remove(key);
					value = values[guid];
					delete values[guid];
					return true;
				} else {
					return false;
				}
			},

			/**
			 Check whether a key is present.

			 @method has
			 @param {anything} key
			 @return {Boolean} true if the item was present, false otherwise
			 */
			has: function(key) {
				var values = this.values,
					guid = guidFor(key);

				return values.hasOwnProperty(guid);
			},

			/**
			 Iterate over all the keys and values. Calls the function once
			 for each key, passing in the key and value, in that order.

			 The keys are guaranteed to be iterated over in insertion order.

			 @method forEach
			 @param {Function} callback
			 @param {anything} self if passed, the `this` value inside the
			 callback. By default, `this` is the map.
			 */
			forEach: function(callback, self) {
				var keys = this.keys,
					values = this.values;

				keys.forEach(function(key) {
					var guid = guidFor(key);
					callback.call(self, key, values[guid]);
				});
			},

			/**
			 @method copy
			 @return {Ember.Map}
			 */
			copy: function() {
				return copyMap(this, new Map());
			}
		};

		/**
		 @class MapWithDefault
		 @namespace Ember
		 @extends Ember.Map
		 @private
		 @constructor
		 @param [options]
		 @param {anything} [options.defaultValue]
		 */
		var MapWithDefault = Ember.MapWithDefault = function(options) {
			Map.call(this);
			this.defaultValue = options.defaultValue;
		};

		/**
		 @method create
		 @static
		 @param [options]
		 @param {anything} [options.defaultValue]
		 @return {Ember.MapWithDefault|Ember.Map} If options are passed, returns
		 `Ember.MapWithDefault` otherwise returns `Ember.Map`
		 */
		MapWithDefault.create = function(options) {
			if (options) {
				return new MapWithDefault(options);
			} else {
				return new Map();
			}
		};

		MapWithDefault.prototype = Ember.create(Map.prototype);

		/**
		 Retrieve the value associated with a given key.

		 @method get
		 @param {anything} key
		 @return {anything} the value associated with the key, or the default value
		 */
		MapWithDefault.prototype.get = function(key) {
			var hasValue = this.has(key);

			if (hasValue) {
				return Map.prototype.get.call(this, key);
			} else {
				var defaultValue = this.defaultValue(key);
				this.set(key, defaultValue);
				return defaultValue;
			}
		};

		/**
		 @method copy
		 @return {Ember.MapWithDefault}
		 */
		MapWithDefault.prototype.copy = function() {
			return copyMap(this, new MapWithDefault({
				defaultValue: this.defaultValue
			}));
		};

	})();



	(function() {
		/**
		 @module ember-metal
		 */

		var META_KEY = Ember.META_KEY, get, set;

		var MANDATORY_SETTER = Ember.ENV.MANDATORY_SETTER;

		var IS_GLOBAL = /^([A-Z$]|([0-9][A-Z$]))/;
		var IS_GLOBAL_PATH = /^([A-Z$]|([0-9][A-Z$])).*[\.\*]/;
		var HAS_THIS  = /^this[\.\*]/;
		var FIRST_KEY = /^([^\.\*]+)/;

// ..........................................................
// GET AND SET
//
// If we are on a platform that supports accessors we can use those.
// Otherwise simulate accessors by looking up the property directly on the
// object.

		/**
		 Gets the value of a property on an object. If the property is computed,
		 the function will be invoked. If the property is not defined but the
		 object implements the `unknownProperty` method then that will be invoked.

		 If you plan to run on IE8 and older browsers then you should use this
		 method anytime you want to retrieve a property on an object that you don't
		 know for sure is private. (Properties beginning with an underscore '_'
		 are considered private.)

		 On all newer browsers, you only need to use this method to retrieve
		 properties if the property might not be defined on the object and you want
		 to respect the `unknownProperty` handler. Otherwise you can ignore this
		 method.

		 Note that if the object itself is `undefined`, this method will throw
		 an error.

		 @method get
		 @for Ember
		 @param {Object} obj The object to retrieve from.
		 @param {String} keyName The property key to retrieve
		 @return {Object} the property value or `null`.
		 */
		get = function get(obj, keyName) {
			// Helpers that operate with 'this' within an #each
			if (keyName === '') {
				return obj;
			}

			if (!keyName && 'string'===typeof obj) {
				keyName = obj;
				obj = null;
			}

			if (!obj || keyName.indexOf('.') !== -1) {
				Ember.assert("Cannot call get with '"+ keyName +"' on an undefined object.", obj !== undefined);
				return getPath(obj, keyName);
			}

			Ember.assert("You need to provide an object and key to `get`.", !!obj && keyName);

			var meta = obj[META_KEY], desc = meta && meta.descs[keyName], ret;
			if (desc) {
				return desc.get(obj, keyName);
			} else {
				if (MANDATORY_SETTER && meta && meta.watching[keyName] > 0) {
					ret = meta.values[keyName];
				} else {
					ret = obj[keyName];
				}

				if (ret === undefined &&
					'object' === typeof obj && !(keyName in obj) && 'function' === typeof obj.unknownProperty) {
					return obj.unknownProperty(keyName);
				}

				return ret;
			}
		};

		/**
		 Sets the value of a property on an object, respecting computed properties
		 and notifying observers and other listeners of the change. If the
		 property is not defined but the object implements the `unknownProperty`
		 method then that will be invoked as well.

		 If you plan to run on IE8 and older browsers then you should use this
		 method anytime you want to set a property on an object that you don't
		 know for sure is private. (Properties beginning with an underscore '_'
		 are considered private.)

		 On all newer browsers, you only need to use this method to set
		 properties if the property might not be defined on the object and you want
		 to respect the `unknownProperty` handler. Otherwise you can ignore this
		 method.

		 @method set
		 @for Ember
		 @param {Object} obj The object to modify.
		 @param {String} keyName The property key to set
		 @param {Object} value The value to set
		 @return {Object} the passed value.
		 */
		set = function set(obj, keyName, value, tolerant) {
			if (typeof obj === 'string') {
				Ember.assert("Path '" + obj + "' must be global if no obj is given.", IS_GLOBAL.test(obj));
				value = keyName;
				keyName = obj;
				obj = null;
			}

			if (!obj || keyName.indexOf('.') !== -1) {
				return setPath(obj, keyName, value, tolerant);
			}

			Ember.assert("You need to provide an object and key to `set`.", !!obj && keyName !== undefined);
			Ember.assert('calling set on destroyed object', !obj.isDestroyed);

			var meta = obj[META_KEY], desc = meta && meta.descs[keyName],
				isUnknown, currentValue;
			if (desc) {
				desc.set(obj, keyName, value);
			} else {
				isUnknown = 'object' === typeof obj && !(keyName in obj);

				// setUnknownProperty is called if `obj` is an object,
				// the property does not already exist, and the
				// `setUnknownProperty` method exists on the object
				if (isUnknown && 'function' === typeof obj.setUnknownProperty) {
					obj.setUnknownProperty(keyName, value);
				} else if (meta && meta.watching[keyName] > 0) {
					if (MANDATORY_SETTER) {
						currentValue = meta.values[keyName];
					} else {
						currentValue = obj[keyName];
					}
					// only trigger a change if the value has changed
					if (value !== currentValue) {
						Ember.propertyWillChange(obj, keyName);
						if (MANDATORY_SETTER) {
							if (currentValue === undefined && !(keyName in obj)) {
								Ember.defineProperty(obj, keyName, null, value); // setup mandatory setter
							} else {
								meta.values[keyName] = value;
							}
						} else {
							obj[keyName] = value;
						}
						Ember.propertyDidChange(obj, keyName);
					}
				} else {
					obj[keyName] = value;
				}
			}
			return value;
		};

// Currently used only by Ember Data tests
		if (Ember.config.overrideAccessors) {
			Ember.get = get;
			Ember.set = set;
			Ember.config.overrideAccessors();
			get = Ember.get;
			set = Ember.set;
		}

		function firstKey(path) {
			return path.match(FIRST_KEY)[0];
		}

// assumes path is already normalized
		function normalizeTuple(target, path) {
			var hasThis  = HAS_THIS.test(path),
				isGlobal = !hasThis && IS_GLOBAL_PATH.test(path),
				key;

			if (!target || isGlobal) target = Ember.lookup;
			if (hasThis) path = path.slice(5);

			if (target === Ember.lookup) {
				key = firstKey(path);
				target = get(target, key);
				path   = path.slice(key.length+1);
			}

			// must return some kind of path to be valid else other things will break.
			if (!path || path.length===0) throw new Error('Invalid Path');

			return [ target, path ];
		}

		function getPath(root, path) {
			var hasThis, parts, tuple, idx, len;

			// If there is no root and path is a key name, return that
			// property from the global object.
			// E.g. get('Ember') -> Ember
			if (root === null && path.indexOf('.') === -1) { return get(Ember.lookup, path); }

			// detect complicated paths and normalize them
			hasThis  = HAS_THIS.test(path);

			if (!root || hasThis) {
				tuple = normalizeTuple(root, path);
				root = tuple[0];
				path = tuple[1];
				tuple.length = 0;
			}

			parts = path.split(".");
			len = parts.length;
			for (idx=0; root && idx<len; idx++) {
				root = get(root, parts[idx], true);
				if (root && root.isDestroyed) { return undefined; }
			}
			return root;
		}

		function setPath(root, path, value, tolerant) {
			var keyName;

			// get the last part of the path
			keyName = path.slice(path.lastIndexOf('.') + 1);

			// get the first part of the part
			path    = path.slice(0, path.length-(keyName.length+1));

			// unless the path is this, look up the first part to
			// get the root
			if (path !== 'this') {
				root = getPath(root, path);
			}

			if (!keyName || keyName.length === 0) {
				throw new Error('You passed an empty path');
			}

			if (!root) {
				if (tolerant) { return; }
				else { throw new Error('Object in path '+path+' could not be found or was destroyed.'); }
			}

			return set(root, keyName, value);
		}

		/**
		 @private

		 Normalizes a target/path pair to reflect that actual target/path that should
		 be observed, etc. This takes into account passing in global property
		 paths (i.e. a path beginning with a captial letter not defined on the
		 target) and * separators.

		 @method normalizeTuple
		 @for Ember
		 @param {Object} target The current target. May be `null`.
		 @param {String} path A path on the target or a global property path.
		 @return {Array} a temporary array with the normalized target/path pair.
		 */
		Ember.normalizeTuple = function(target, path) {
			return normalizeTuple(target, path);
		};

		Ember.getWithDefault = function(root, key, defaultValue) {
			var value = get(root, key);

			if (value === undefined) { return defaultValue; }
			return value;
		};


		Ember.get = get;
		Ember.getPath = Ember.deprecateFunc('getPath is deprecated since get now supports paths', Ember.get);

		Ember.set = set;
		Ember.setPath = Ember.deprecateFunc('setPath is deprecated since set now supports paths', Ember.set);

		/**
		 Error-tolerant form of `Ember.set`. Will not blow up if any part of the
		 chain is `undefined`, `null`, or destroyed.

		 This is primarily used when syncing bindings, which may try to update after
		 an object has been destroyed.

		 @method trySet
		 @for Ember
		 @param {Object} obj The object to modify.
		 @param {String} path The property path to set
		 @param {Object} value The value to set
		 */
		Ember.trySet = function(root, path, value) {
			return set(root, path, value, true);
		};
		Ember.trySetPath = Ember.deprecateFunc('trySetPath has been renamed to trySet', Ember.trySet);

		/**
		 Returns true if the provided path is global (e.g., `MyApp.fooController.bar`)
		 instead of local (`foo.bar.baz`).

		 @method isGlobalPath
		 @for Ember
		 @private
		 @param {String} path
		 @return Boolean
		 */
		Ember.isGlobalPath = function(path) {
			return IS_GLOBAL.test(path);
		};


	})();



	(function() {
		/**
		 @module ember-metal
		 */

		var META_KEY = Ember.META_KEY,
			metaFor = Ember.meta,
			objectDefineProperty = Ember.platform.defineProperty;

		var MANDATORY_SETTER = Ember.ENV.MANDATORY_SETTER;

// ..........................................................
// DESCRIPTOR
//

		/**
		 Objects of this type can implement an interface to responds requests to
		 get and set. The default implementation handles simple properties.

		 You generally won't need to create or subclass this directly.

		 @class Descriptor
		 @namespace Ember
		 @private
		 @constructor
		 */
		var Descriptor = Ember.Descriptor = function() {};

// ..........................................................
// DEFINING PROPERTIES API
//

		var MANDATORY_SETTER_FUNCTION = Ember.MANDATORY_SETTER_FUNCTION = function(value) {
			Ember.assert("You must use Ember.set() to access this property (of " + this + ")", false);
		};

		var DEFAULT_GETTER_FUNCTION = Ember.DEFAULT_GETTER_FUNCTION = function(name) {
			return function() {
				var meta = this[META_KEY];
				return meta && meta.values[name];
			};
		};

		/**
		 @private

		 NOTE: This is a low-level method used by other parts of the API. You almost
		 never want to call this method directly. Instead you should use
		 `Ember.mixin()` to define new properties.

		 Defines a property on an object. This method works much like the ES5
		 `Object.defineProperty()` method except that it can also accept computed
		 properties and other special descriptors.

		 Normally this method takes only three parameters. However if you pass an
		 instance of `Ember.Descriptor` as the third param then you can pass an
		 optional value as the fourth parameter. This is often more efficient than
		 creating new descriptor hashes for each property.

		 ## Examples

		 ```javascript
		 // ES5 compatible mode
		 Ember.defineProperty(contact, 'firstName', {
    writable: true,
    configurable: false,
    enumerable: true,
    value: 'Charles'
  });

		 // define a simple property
		 Ember.defineProperty(contact, 'lastName', undefined, 'Jolley');

		 // define a computed property
		 Ember.defineProperty(contact, 'fullName', Ember.computed(function() {
    return this.firstName+' '+this.lastName;
  }).property('firstName', 'lastName'));
		 ```

		 @method defineProperty
		 @for Ember
		 @param {Object} obj the object to define this property on. This may be a prototype.
		 @param {String} keyName the name of the property
		 @param {Ember.Descriptor} [desc] an instance of `Ember.Descriptor` (typically a
		 computed property) or an ES5 descriptor.
		 You must provide this or `data` but not both.
		 @param {anything} [data] something other than a descriptor, that will
		 become the explicit value of this property.
		 */
		Ember.defineProperty = function(obj, keyName, desc, data, meta) {
			var descs, existingDesc, watching, value;

			if (!meta) meta = metaFor(obj);
			descs = meta.descs;
			existingDesc = meta.descs[keyName];
			watching = meta.watching[keyName] > 0;

			if (existingDesc instanceof Ember.Descriptor) {
				existingDesc.teardown(obj, keyName);
			}

			if (desc instanceof Ember.Descriptor) {
				value = desc;

				descs[keyName] = desc;
				if (MANDATORY_SETTER && watching) {
					objectDefineProperty(obj, keyName, {
						configurable: true,
						enumerable: true,
						writable: true,
						value: undefined // make enumerable
					});
				} else {
					obj[keyName] = undefined; // make enumerable
				}
				desc.setup(obj, keyName);
			} else {
				descs[keyName] = undefined; // shadow descriptor in proto
				if (desc == null) {
					value = data;

					if (MANDATORY_SETTER && watching) {
						meta.values[keyName] = data;
						objectDefineProperty(obj, keyName, {
							configurable: true,
							enumerable: true,
							set: MANDATORY_SETTER_FUNCTION,
							get: DEFAULT_GETTER_FUNCTION(keyName)
						});
					} else {
						obj[keyName] = data;
					}
				} else {
					value = desc;

					// compatibility with ES5
					objectDefineProperty(obj, keyName, desc);
				}
			}

			// if key is being watched, override chains that
			// were initialized with the prototype
			if (watching) { Ember.overrideChains(obj, keyName, meta); }

			// The `value` passed to the `didDefineProperty` hook is
			// either the descriptor or data, whichever was passed.
			if (obj.didDefineProperty) { obj.didDefineProperty(obj, keyName, value); }

			return this;
		};


	})();



	(function() {
// Ember.tryFinally
		/**
		 @module ember-metal
		 */

		var AFTER_OBSERVERS = ':change';
		var BEFORE_OBSERVERS = ':before';

		var guidFor = Ember.guidFor;

		var deferred = 0;

		/*
		 this.observerSet = {
		 [senderGuid]: { // variable name: `keySet`
		 [keyName]: listIndex
		 }
		 },
		 this.observers = [
		 {
		 sender: obj,
		 keyName: keyName,
		 eventName: eventName,
		 listeners: [
		 [target, method, onceFlag, suspendedFlag]
		 ]
		 },
		 ...
		 ]
		 */
		function ObserverSet() {
			this.clear();
		}

		ObserverSet.prototype.add = function(sender, keyName, eventName) {
			var observerSet = this.observerSet,
				observers = this.observers,
				senderGuid = Ember.guidFor(sender),
				keySet = observerSet[senderGuid],
				index;

			if (!keySet) {
				observerSet[senderGuid] = keySet = {};
			}
			index = keySet[keyName];
			if (index === undefined) {
				index = observers.push({
					sender: sender,
					keyName: keyName,
					eventName: eventName,
					listeners: []
				}) - 1;
				keySet[keyName] = index;
			}
			return observers[index].listeners;
		};

		ObserverSet.prototype.flush = function() {
			var observers = this.observers, i, len, observer, sender;
			this.clear();
			for (i=0, len=observers.length; i < len; ++i) {
				observer = observers[i];
				sender = observer.sender;
				if (sender.isDestroying || sender.isDestroyed) { continue; }
				Ember.sendEvent(sender, observer.eventName, [sender, observer.keyName], observer.listeners);
			}
		};

		ObserverSet.prototype.clear = function() {
			this.observerSet = {};
			this.observers = [];
		};

		var beforeObserverSet = new ObserverSet(), observerSet = new ObserverSet();

		/**
		 @method beginPropertyChanges
		 @chainable
		 */
		Ember.beginPropertyChanges = function() {
			deferred++;
		};

		/**
		 @method endPropertyChanges
		 */
		Ember.endPropertyChanges = function() {
			deferred--;
			if (deferred<=0) {
				beforeObserverSet.clear();
				observerSet.flush();
			}
		};

		/**
		 Make a series of property changes together in an
		 exception-safe way.

		 ```javascript
		 Ember.changeProperties(function() {
    obj1.set('foo', mayBlowUpWhenSet);
    obj2.set('bar', baz);
  });
		 ```

		 @method changeProperties
		 @param {Function} callback
		 @param [binding]
		 */
		Ember.changeProperties = function(cb, binding){
			Ember.beginPropertyChanges();
			Ember.tryFinally(cb, Ember.endPropertyChanges, binding);
		};

		/**
		 Set a list of properties on an object. These properties are set inside
		 a single `beginPropertyChanges` and `endPropertyChanges` batch, so
		 observers will be buffered.

		 @method setProperties
		 @param target
		 @param {Hash} properties
		 @return target
		 */
		Ember.setProperties = function(self, hash) {
			Ember.changeProperties(function(){
				for(var prop in hash) {
					if (hash.hasOwnProperty(prop)) Ember.set(self, prop, hash[prop]);
				}
			});
			return self;
		};


		function changeEvent(keyName) {
			return keyName+AFTER_OBSERVERS;
		}

		function beforeEvent(keyName) {
			return keyName+BEFORE_OBSERVERS;
		}

		/**
		 @method addObserver
		 @param obj
		 @param {String} path
		 @param {Object|Function} targetOrMethod
		 @param {Function|String} [method]
		 */
		Ember.addObserver = function(obj, path, target, method) {
			Ember.addListener(obj, changeEvent(path), target, method);
			Ember.watch(obj, path);
			return this;
		};

		Ember.observersFor = function(obj, path) {
			return Ember.listenersFor(obj, changeEvent(path));
		};

		/**
		 @method removeObserver
		 @param obj
		 @param {String} path
		 @param {Object|Function} targetOrMethod
		 @param {Function|String} [method]
		 */
		Ember.removeObserver = function(obj, path, target, method) {
			Ember.unwatch(obj, path);
			Ember.removeListener(obj, changeEvent(path), target, method);
			return this;
		};

		/**
		 @method addBeforeObserver
		 @param obj
		 @param {String} path
		 @param {Object|Function} targetOrMethod
		 @param {Function|String} [method]
		 */
		Ember.addBeforeObserver = function(obj, path, target, method) {
			Ember.addListener(obj, beforeEvent(path), target, method);
			Ember.watch(obj, path);
			return this;
		};

// Suspend observer during callback.
//
// This should only be used by the target of the observer
// while it is setting the observed path.
		Ember._suspendBeforeObserver = function(obj, path, target, method, callback) {
			return Ember._suspendListener(obj, beforeEvent(path), target, method, callback);
		};

		Ember._suspendObserver = function(obj, path, target, method, callback) {
			return Ember._suspendListener(obj, changeEvent(path), target, method, callback);
		};

		var map = Ember.ArrayPolyfills.map;

		Ember._suspendBeforeObservers = function(obj, paths, target, method, callback) {
			var events = map.call(paths, beforeEvent);
			return Ember._suspendListeners(obj, events, target, method, callback);
		};

		Ember._suspendObservers = function(obj, paths, target, method, callback) {
			var events = map.call(paths, changeEvent);
			return Ember._suspendListeners(obj, events, target, method, callback);
		};

		Ember.beforeObserversFor = function(obj, path) {
			return Ember.listenersFor(obj, beforeEvent(path));
		};

		/**
		 @method removeBeforeObserver
		 @param obj
		 @param {String} path
		 @param {Object|Function} targetOrMethod
		 @param {Function|String} [method]
		 */
		Ember.removeBeforeObserver = function(obj, path, target, method) {
			Ember.unwatch(obj, path);
			Ember.removeListener(obj, beforeEvent(path), target, method);
			return this;
		};

		Ember.notifyBeforeObservers = function(obj, keyName) {
			if (obj.isDestroying) { return; }

			var eventName = beforeEvent(keyName), listeners, listenersDiff;
			if (deferred) {
				listeners = beforeObserverSet.add(obj, keyName, eventName);
				listenersDiff = Ember.listenersDiff(obj, eventName, listeners);
				Ember.sendEvent(obj, eventName, [obj, keyName], listenersDiff);
			} else {
				Ember.sendEvent(obj, eventName, [obj, keyName]);
			}
		};

		Ember.notifyObservers = function(obj, keyName) {
			if (obj.isDestroying) { return; }

			var eventName = changeEvent(keyName), listeners;
			if (deferred) {
				listeners = observerSet.add(obj, keyName, eventName);
				Ember.listenersUnion(obj, eventName, listeners);
			} else {
				Ember.sendEvent(obj, eventName, [obj, keyName]);
			}
		};

	})();



	(function() {
		/**
		 @module ember-metal
		 */

		var guidFor = Ember.guidFor, // utils.js
			metaFor = Ember.meta, // utils.js
			get = Ember.get, // accessors.js
			set = Ember.set, // accessors.js
			normalizeTuple = Ember.normalizeTuple, // accessors.js
			GUID_KEY = Ember.GUID_KEY, // utils.js
			META_KEY = Ember.META_KEY, // utils.js
		// circular reference observer depends on Ember.watch
		// we should move change events to this file or its own property_events.js
			forEach = Ember.ArrayPolyfills.forEach, // array.js
			FIRST_KEY = /^([^\.\*]+)/,
			IS_PATH = /[\.\*]/;

		var MANDATORY_SETTER = Ember.ENV.MANDATORY_SETTER,
			o_defineProperty = Ember.platform.defineProperty;

		function firstKey(path) {
			return path.match(FIRST_KEY)[0];
		}

// returns true if the passed path is just a keyName
		function isKeyName(path) {
			return path==='*' || !IS_PATH.test(path);
		}

// ..........................................................
// DEPENDENT KEYS
//

		function iterDeps(method, obj, depKey, seen, meta) {

			var guid = guidFor(obj);
			if (!seen[guid]) seen[guid] = {};
			if (seen[guid][depKey]) return;
			seen[guid][depKey] = true;

			var deps = meta.deps;
			deps = deps && deps[depKey];
			if (deps) {
				for(var key in deps) {
					var desc = meta.descs[key];
					if (desc && desc._suspended === obj) continue;
					method(obj, key);
				}
			}
		}


		var WILL_SEEN, DID_SEEN;

// called whenever a property is about to change to clear the cache of any dependent keys (and notify those properties of changes, etc...)
		function dependentKeysWillChange(obj, depKey, meta) {
			if (obj.isDestroying) { return; }

			var seen = WILL_SEEN, top = !seen;
			if (top) { seen = WILL_SEEN = {}; }
			iterDeps(propertyWillChange, obj, depKey, seen, meta);
			if (top) { WILL_SEEN = null; }
		}

// called whenever a property has just changed to update dependent keys
		function dependentKeysDidChange(obj, depKey, meta) {
			if (obj.isDestroying) { return; }

			var seen = DID_SEEN, top = !seen;
			if (top) { seen = DID_SEEN = {}; }
			iterDeps(propertyDidChange, obj, depKey, seen, meta);
			if (top) { DID_SEEN = null; }
		}

// ..........................................................
// CHAIN
//

		function addChainWatcher(obj, keyName, node) {
			if (!obj || ('object' !== typeof obj)) { return; } // nothing to do

			var m = metaFor(obj), nodes = m.chainWatchers;

			if (!m.hasOwnProperty('chainWatchers')) {
				nodes = m.chainWatchers = {};
			}

			if (!nodes[keyName]) { nodes[keyName] = []; }
			nodes[keyName].push(node);
			Ember.watch(obj, keyName);
		}

		function removeChainWatcher(obj, keyName, node) {
			if (!obj || 'object' !== typeof obj) { return; } // nothing to do

			var m = metaFor(obj, false);
			if (!m.hasOwnProperty('chainWatchers')) { return; } // nothing to do

			var nodes = m.chainWatchers;

			if (nodes[keyName]) {
				nodes = nodes[keyName];
				for (var i = 0, l = nodes.length; i < l; i++) {
					if (nodes[i] === node) { nodes.splice(i, 1); }
				}
			}
			Ember.unwatch(obj, keyName);
		}

		var pendingQueue = [];

// attempts to add the pendingQueue chains again. If some of them end up
// back in the queue and reschedule is true, schedules a timeout to try
// again.
		function flushPendingChains() {
			if (pendingQueue.length === 0) { return; } // nothing to do

			var queue = pendingQueue;
			pendingQueue = [];

			forEach.call(queue, function(q) { q[0].add(q[1]); });

			Ember.warn('Watching an undefined global, Ember expects watched globals to be setup by the time the run loop is flushed, check for typos', pendingQueue.length === 0);
		}

		function isProto(pvalue) {
			return metaFor(pvalue, false).proto === pvalue;
		}

// A ChainNode watches a single key on an object. If you provide a starting
// value for the key then the node won't actually watch it. For a root node
// pass null for parent and key and object for value.
		var ChainNode = function(parent, key, value) {
			var obj;
			this._parent = parent;
			this._key    = key;

			// _watching is true when calling get(this._parent, this._key) will
			// return the value of this node.
			//
			// It is false for the root of a chain (because we have no parent)
			// and for global paths (because the parent node is the object with
			// the observer on it)
			this._watching = value===undefined;

			this._value  = value;
			this._paths = {};
			if (this._watching) {
				this._object = parent.value();
				if (this._object) { addChainWatcher(this._object, this._key, this); }
			}

			// Special-case: the EachProxy relies on immediate evaluation to
			// establish its observers.
			//
			// TODO: Replace this with an efficient callback that the EachProxy
			// can implement.
			if (this._parent && this._parent._key === '@each') {
				this.value();
			}
		};

		var ChainNodePrototype = ChainNode.prototype;

		ChainNodePrototype.value = function() {
			if (this._value === undefined && this._watching) {
				var obj = this._parent.value();
				this._value = (obj && !isProto(obj)) ? get(obj, this._key) : undefined;
			}
			return this._value;
		};

		ChainNodePrototype.destroy = function() {
			if (this._watching) {
				var obj = this._object;
				if (obj) { removeChainWatcher(obj, this._key, this); }
				this._watching = false; // so future calls do nothing
			}
		};

// copies a top level object only
		ChainNodePrototype.copy = function(obj) {
			var ret = new ChainNode(null, null, obj),
				paths = this._paths, path;
			for (path in paths) {
				if (paths[path] <= 0) { continue; } // this check will also catch non-number vals.
				ret.add(path);
			}
			return ret;
		};

// called on the root node of a chain to setup watchers on the specified
// path.
		ChainNodePrototype.add = function(path) {
			var obj, tuple, key, src, paths;

			paths = this._paths;
			paths[path] = (paths[path] || 0) + 1;

			obj = this.value();
			tuple = normalizeTuple(obj, path);

			// the path was a local path
			if (tuple[0] && tuple[0] === obj) {
				path = tuple[1];
				key  = firstKey(path);
				path = path.slice(key.length+1);

				// global path, but object does not exist yet.
				// put into a queue and try to connect later.
			} else if (!tuple[0]) {
				pendingQueue.push([this, path]);
				tuple.length = 0;
				return;

				// global path, and object already exists
			} else {
				src  = tuple[0];
				key  = path.slice(0, 0-(tuple[1].length+1));
				path = tuple[1];
			}

			tuple.length = 0;
			this.chain(key, path, src);
		};

// called on the root node of a chain to teardown watcher on the specified
// path
		ChainNodePrototype.remove = function(path) {
			var obj, tuple, key, src, paths;

			paths = this._paths;
			if (paths[path] > 0) { paths[path]--; }

			obj = this.value();
			tuple = normalizeTuple(obj, path);
			if (tuple[0] === obj) {
				path = tuple[1];
				key  = firstKey(path);
				path = path.slice(key.length+1);
			} else {
				src  = tuple[0];
				key  = path.slice(0, 0-(tuple[1].length+1));
				path = tuple[1];
			}

			tuple.length = 0;
			this.unchain(key, path);
		};

		ChainNodePrototype.count = 0;

		ChainNodePrototype.chain = function(key, path, src) {
			var chains = this._chains, node;
			if (!chains) { chains = this._chains = {}; }

			node = chains[key];
			if (!node) { node = chains[key] = new ChainNode(this, key, src); }
			node.count++; // count chains...

			// chain rest of path if there is one
			if (path && path.length>0) {
				key = firstKey(path);
				path = path.slice(key.length+1);
				node.chain(key, path); // NOTE: no src means it will observe changes...
			}
		};

		ChainNodePrototype.unchain = function(key, path) {
			var chains = this._chains, node = chains[key];

			// unchain rest of path first...
			if (path && path.length>1) {
				key  = firstKey(path);
				path = path.slice(key.length+1);
				node.unchain(key, path);
			}

			// delete node if needed.
			node.count--;
			if (node.count<=0) {
				delete chains[node._key];
				node.destroy();
			}

		};

		ChainNodePrototype.willChange = function() {
			var chains = this._chains;
			if (chains) {
				for(var key in chains) {
					if (!chains.hasOwnProperty(key)) { continue; }
					chains[key].willChange();
				}
			}

			if (this._parent) { this._parent.chainWillChange(this, this._key, 1); }
		};

		ChainNodePrototype.chainWillChange = function(chain, path, depth) {
			if (this._key) { path = this._key + '.' + path; }

			if (this._parent) {
				this._parent.chainWillChange(this, path, depth+1);
			} else {
				if (depth > 1) { Ember.propertyWillChange(this.value(), path); }
				path = 'this.' + path;
				if (this._paths[path] > 0) { Ember.propertyWillChange(this.value(), path); }
			}
		};

		ChainNodePrototype.chainDidChange = function(chain, path, depth) {
			if (this._key) { path = this._key + '.' + path; }
			if (this._parent) {
				this._parent.chainDidChange(this, path, depth+1);
			} else {
				if (depth > 1) { Ember.propertyDidChange(this.value(), path); }
				path = 'this.' + path;
				if (this._paths[path] > 0) { Ember.propertyDidChange(this.value(), path); }
			}
		};

		ChainNodePrototype.didChange = function(suppressEvent) {
			// invalidate my own value first.
			if (this._watching) {
				var obj = this._parent.value();
				if (obj !== this._object) {
					removeChainWatcher(this._object, this._key, this);
					this._object = obj;
					addChainWatcher(obj, this._key, this);
				}
				this._value  = undefined;

				// Special-case: the EachProxy relies on immediate evaluation to
				// establish its observers.
				if (this._parent && this._parent._key === '@each')
					this.value();
			}

			// then notify chains...
			var chains = this._chains;
			if (chains) {
				for(var key in chains) {
					if (!chains.hasOwnProperty(key)) { continue; }
					chains[key].didChange(suppressEvent);
				}
			}

			if (suppressEvent) { return; }

			// and finally tell parent about my path changing...
			if (this._parent) { this._parent.chainDidChange(this, this._key, 1); }
		};

// get the chains for the current object. If the current object has
// chains inherited from the proto they will be cloned and reconfigured for
// the current object.
		function chainsFor(obj) {
			var m = metaFor(obj), ret = m.chains;
			if (!ret) {
				ret = m.chains = new ChainNode(null, null, obj);
			} else if (ret.value() !== obj) {
				ret = m.chains = ret.copy(obj);
			}
			return ret;
		}

		Ember.overrideChains = function(obj, keyName, m) {
			chainsDidChange(obj, keyName, m, true);
		};

		function chainsWillChange(obj, keyName, m, arg) {
			if (!m.hasOwnProperty('chainWatchers')) { return; } // nothing to do

			var nodes = m.chainWatchers;

			nodes = nodes[keyName];
			if (!nodes) { return; }

			for(var i = 0, l = nodes.length; i < l; i++) {
				nodes[i].willChange(arg);
			}
		}

		function chainsDidChange(obj, keyName, m, arg) {
			if (!m.hasOwnProperty('chainWatchers')) { return; } // nothing to do

			var nodes = m.chainWatchers;

			nodes = nodes[keyName];
			if (!nodes) { return; }

			// looping in reverse because the chainWatchers array can be modified inside didChange
			for (var i = nodes.length - 1; i >= 0; i--) {
				nodes[i].didChange(arg);
			}
		}

// ..........................................................
// WATCH
//

		/**
		 @private

		 Starts watching a property on an object. Whenever the property changes,
		 invokes `Ember.propertyWillChange` and `Ember.propertyDidChange`. This is the
		 primitive used by observers and dependent keys; usually you will never call
		 this method directly but instead use higher level methods like
		 `Ember.addObserver()`

		 @method watch
		 @for Ember
		 @param obj
		 @param {String} keyName
		 */
		Ember.watch = function(obj, keyName) {
			// can't watch length on Array - it is special...
			if (keyName === 'length' && Ember.typeOf(obj) === 'array') { return this; }

			var m = metaFor(obj), watching = m.watching, desc;

			// activate watching first time
			if (!watching[keyName]) {
				watching[keyName] = 1;
				if (isKeyName(keyName)) {
					desc = m.descs[keyName];
					if (desc && desc.willWatch) { desc.willWatch(obj, keyName); }

					if ('function' === typeof obj.willWatchProperty) {
						obj.willWatchProperty(keyName);
					}

					if (MANDATORY_SETTER && keyName in obj) {
						m.values[keyName] = obj[keyName];
						o_defineProperty(obj, keyName, {
							configurable: true,
							enumerable: true,
							set: Ember.MANDATORY_SETTER_FUNCTION,
							get: Ember.DEFAULT_GETTER_FUNCTION(keyName)
						});
					}
				} else {
					chainsFor(obj).add(keyName);
				}

			}  else {
				watching[keyName] = (watching[keyName] || 0) + 1;
			}
			return this;
		};

		Ember.isWatching = function isWatching(obj, key) {
			var meta = obj[META_KEY];
			return (meta && meta.watching[key]) > 0;
		};

		Ember.watch.flushPending = flushPendingChains;

		Ember.unwatch = function(obj, keyName) {
			// can't watch length on Array - it is special...
			if (keyName === 'length' && Ember.typeOf(obj) === 'array') { return this; }

			var m = metaFor(obj), watching = m.watching, desc;

			if (watching[keyName] === 1) {
				watching[keyName] = 0;

				if (isKeyName(keyName)) {
					desc = m.descs[keyName];
					if (desc && desc.didUnwatch) { desc.didUnwatch(obj, keyName); }

					if ('function' === typeof obj.didUnwatchProperty) {
						obj.didUnwatchProperty(keyName);
					}

					if (MANDATORY_SETTER && keyName in obj) {
						o_defineProperty(obj, keyName, {
							configurable: true,
							enumerable: true,
							writable: true,
							value: m.values[keyName]
						});
						delete m.values[keyName];
					}
				} else {
					chainsFor(obj).remove(keyName);
				}

			} else if (watching[keyName]>1) {
				watching[keyName]--;
			}

			return this;
		};

		/**
		 @private

		 Call on an object when you first beget it from another object. This will
		 setup any chained watchers on the object instance as needed. This method is
		 safe to call multiple times.

		 @method rewatch
		 @for Ember
		 @param obj
		 */
		Ember.rewatch = function(obj) {
			var m = metaFor(obj, false), chains = m.chains;

			// make sure the object has its own guid.
			if (GUID_KEY in obj && !obj.hasOwnProperty(GUID_KEY)) {
				Ember.generateGuid(obj, 'ember');
			}

			// make sure any chained watchers update.
			if (chains && chains.value() !== obj) {
				m.chains = chains.copy(obj);
			}

			return this;
		};

		Ember.finishChains = function(obj) {
			var m = metaFor(obj, false), chains = m.chains;
			if (chains) {
				if (chains.value() !== obj) {
					m.chains = chains = chains.copy(obj);
				}
				chains.didChange(true);
			}
		};

// ..........................................................
// PROPERTY CHANGES
//

		/**
		 This function is called just before an object property is about to change.
		 It will notify any before observers and prepare caches among other things.

		 Normally you will not need to call this method directly but if for some
		 reason you can't directly watch a property you can invoke this method
		 manually along with `Ember.propertyDidChange()` which you should call just
		 after the property value changes.

		 @method propertyWillChange
		 @for Ember
		 @param {Object} obj The object with the property that will change
		 @param {String} keyName The property key (or path) that will change.
		 @return {void}
		 */
		function propertyWillChange(obj, keyName) {
			var m = metaFor(obj, false),
				watching = m.watching[keyName] > 0 || keyName === 'length',
				proto = m.proto,
				desc = m.descs[keyName];

			if (!watching) { return; }
			if (proto === obj) { return; }
			if (desc && desc.willChange) { desc.willChange(obj, keyName); }
			dependentKeysWillChange(obj, keyName, m);
			chainsWillChange(obj, keyName, m);
			Ember.notifyBeforeObservers(obj, keyName);
		}

		Ember.propertyWillChange = propertyWillChange;

		/**
		 This function is called just after an object property has changed.
		 It will notify any observers and clear caches among other things.

		 Normally you will not need to call this method directly but if for some
		 reason you can't directly watch a property you can invoke this method
		 manually along with `Ember.propertyWilLChange()` which you should call just
		 before the property value changes.

		 @method propertyDidChange
		 @for Ember
		 @param {Object} obj The object with the property that will change
		 @param {String} keyName The property key (or path) that will change.
		 @return {void}
		 */
		function propertyDidChange(obj, keyName) {
			var m = metaFor(obj, false),
				watching = m.watching[keyName] > 0 || keyName === 'length',
				proto = m.proto,
				desc = m.descs[keyName];

			if (proto === obj) { return; }

			// shouldn't this mean that we're watching this key?
			if (desc && desc.didChange) { desc.didChange(obj, keyName); }
			if (!watching && keyName !== 'length') { return; }

			dependentKeysDidChange(obj, keyName, m);
			chainsDidChange(obj, keyName, m);
			Ember.notifyObservers(obj, keyName);
		}

		Ember.propertyDidChange = propertyDidChange;

		var NODE_STACK = [];

		/**
		 Tears down the meta on an object so that it can be garbage collected.
		 Multiple calls will have no effect.

		 @method destroy
		 @for Ember
		 @param {Object} obj  the object to destroy
		 @return {void}
		 */
		Ember.destroy = function (obj) {
			var meta = obj[META_KEY], node, nodes, key, nodeObject;
			if (meta) {
				obj[META_KEY] = null;
				// remove chainWatchers to remove circular references that would prevent GC
				node = meta.chains;
				if (node) {
					NODE_STACK.push(node);
					// process tree
					while (NODE_STACK.length > 0) {
						node = NODE_STACK.pop();
						// push children
						nodes = node._chains;
						if (nodes) {
							for (key in nodes) {
								if (nodes.hasOwnProperty(key)) {
									NODE_STACK.push(nodes[key]);
								}
							}
						}
						// remove chainWatcher in node object
						if (node._watching) {
							nodeObject = node._object;
							if (nodeObject) {
								removeChainWatcher(nodeObject, node._key, node);
							}
						}
					}
				}
			}
		};

	})();



	(function() {
		/**
		 @module ember-metal
		 */

		Ember.warn("The CP_DEFAULT_CACHEABLE flag has been removed and computed properties are always cached by default. Use `volatile` if you don't want caching.", Ember.ENV.CP_DEFAULT_CACHEABLE !== false);


		var get = Ember.get,
			set = Ember.set,
			metaFor = Ember.meta,
			a_slice = [].slice,
			o_create = Ember.create,
			META_KEY = Ember.META_KEY,
			watch = Ember.watch,
			unwatch = Ember.unwatch;

// ..........................................................
// DEPENDENT KEYS
//

// data structure:
//  meta.deps = {
//   'depKey': {
//     'keyName': count,
//   }
//  }

		/*
		 This function returns a map of unique dependencies for a
		 given object and key.
		 */
		function keysForDep(obj, depsMeta, depKey) {
			var keys = depsMeta[depKey];
			if (!keys) {
				// if there are no dependencies yet for a the given key
				// create a new empty list of dependencies for the key
				keys = depsMeta[depKey] = {};
			} else if (!depsMeta.hasOwnProperty(depKey)) {
				// otherwise if the dependency list is inherited from
				// a superclass, clone the hash
				keys = depsMeta[depKey] = o_create(keys);
			}
			return keys;
		}

		function metaForDeps(obj, meta) {
			return keysForDep(obj, meta, 'deps');
		}

		function addDependentKeys(desc, obj, keyName, meta) {
			// the descriptor has a list of dependent keys, so
			// add all of its dependent keys.
			var depKeys = desc._dependentKeys, depsMeta, idx, len, depKey, keys;
			if (!depKeys) return;

			depsMeta = metaForDeps(obj, meta);

			for(idx = 0, len = depKeys.length; idx < len; idx++) {
				depKey = depKeys[idx];
				// Lookup keys meta for depKey
				keys = keysForDep(obj, depsMeta, depKey);
				// Increment the number of times depKey depends on keyName.
				keys[keyName] = (keys[keyName] || 0) + 1;
				// Watch the depKey
				watch(obj, depKey);
			}
		}

		function removeDependentKeys(desc, obj, keyName, meta) {
			// the descriptor has a list of dependent keys, so
			// add all of its dependent keys.
			var depKeys = desc._dependentKeys, depsMeta, idx, len, depKey, keys;
			if (!depKeys) return;

			depsMeta = metaForDeps(obj, meta);

			for(idx = 0, len = depKeys.length; idx < len; idx++) {
				depKey = depKeys[idx];
				// Lookup keys meta for depKey
				keys = keysForDep(obj, depsMeta, depKey);
				// Increment the number of times depKey depends on keyName.
				keys[keyName] = (keys[keyName] || 0) - 1;
				// Watch the depKey
				unwatch(obj, depKey);
			}
		}

// ..........................................................
// COMPUTED PROPERTY
//

		/**
		 @class ComputedProperty
		 @namespace Ember
		 @extends Ember.Descriptor
		 @constructor
		 */
		function ComputedProperty(func, opts) {
			this.func = func;

			this._cacheable = (opts && opts.cacheable !== undefined) ? opts.cacheable : true;
			this._dependentKeys = opts && opts.dependentKeys;
			this._readOnly = opts && (opts.readOnly !== undefined || !!opts.readOnly);
		}

		Ember.ComputedProperty = ComputedProperty;
		ComputedProperty.prototype = new Ember.Descriptor();

		var ComputedPropertyPrototype = ComputedProperty.prototype;

		/**
		 Call on a computed property to set it into cacheable mode. When in this
		 mode the computed property will automatically cache the return value of
		 your function until one of the dependent keys changes.

		 ```javascript
		 MyApp.president = Ember.Object.create({
    fullName: function() {
      return this.get('firstName') + ' ' + this.get('lastName');

      // After calculating the value of this function, Ember will
      // return that value without re-executing this function until
      // one of the dependent properties change.
    }.property('firstName', 'lastName')
  });
		 ```

		 Properties are cacheable by default.

		 @method cacheable
		 @param {Boolean} aFlag optional set to `false` to disable caching
		 @return {Ember.ComputedProperty} this
		 @chainable
		 */
		ComputedPropertyPrototype.cacheable = function(aFlag) {
			this._cacheable = aFlag !== false;
			return this;
		};

		/**
		 Call on a computed property to set it into non-cached mode. When in this
		 mode the computed property will not automatically cache the return value.

		 ```javascript
		 MyApp.outsideService = Ember.Object.create({
    value: function() {
      return OutsideService.getValue();
    }.property().volatile()
  });
		 ```

		 @method volatile
		 @return {Ember.ComputedProperty} this
		 @chainable
		 */
		ComputedPropertyPrototype.volatile = function() {
			return this.cacheable(false);
		};

		/**
		 Call on a computed property to set it into read-only mode. When in this
		 mode the computed property will throw an error when set.

		 ```javascript
		 MyApp.person = Ember.Object.create({
    guid: function() {
      return 'guid-guid-guid';
    }.property().readOnly()
  });

		 MyApp.person.set('guid', 'new-guid'); // will throw an exception
		 ```

		 @method readOnly
		 @return {Ember.ComputedProperty} this
		 @chainable
		 */
		ComputedPropertyPrototype.readOnly = function(readOnly) {
			this._readOnly = readOnly === undefined || !!readOnly;
			return this;
		};

		/**
		 Sets the dependent keys on this computed property. Pass any number of
		 arguments containing key paths that this computed property depends on.

		 ```javascript
		 MyApp.president = Ember.Object.create({
    fullName: Ember.computed(function() {
      return this.get('firstName') + ' ' + this.get('lastName');

      // Tell Ember that this computed property depends on firstName
      // and lastName
    }).property('firstName', 'lastName')
  });
		 ```

		 @method property
		 @param {String} path* zero or more property paths
		 @return {Ember.ComputedProperty} this
		 @chainable
		 */
		ComputedPropertyPrototype.property = function() {
			var args = [];
			for (var i = 0, l = arguments.length; i < l; i++) {
				args.push(arguments[i]);
			}
			this._dependentKeys = args;
			return this;
		};

		/**
		 In some cases, you may want to annotate computed properties with additional
		 metadata about how they function or what values they operate on. For example,
		 computed property functions may close over variables that are then no longer
		 available for introspection.

		 You can pass a hash of these values to a computed property like this:

		 ```
		 person: function() {
    var personId = this.get('personId');
    return App.Person.create({ id: personId });
  }.property().meta({ type: App.Person })
		 ```

		 The hash that you pass to the `meta()` function will be saved on the
		 computed property descriptor under the `_meta` key. Ember runtime
		 exposes a public API for retrieving these values from classes,
		 via the `metaForProperty()` function.

		 @method meta
		 @param {Hash} meta
		 @chainable
		 */

		ComputedPropertyPrototype.meta = function(meta) {
			if (arguments.length === 0) {
				return this._meta || {};
			} else {
				this._meta = meta;
				return this;
			}
		};

		/* impl descriptor API */
		ComputedPropertyPrototype.willWatch = function(obj, keyName) {
			// watch already creates meta for this instance
			var meta = obj[META_KEY];
			Ember.assert('watch should have setup meta to be writable', meta.source === obj);
			if (!(keyName in meta.cache)) {
				addDependentKeys(this, obj, keyName, meta);
			}
		};

		ComputedPropertyPrototype.didUnwatch = function(obj, keyName) {
			var meta = obj[META_KEY];
			Ember.assert('unwatch should have setup meta to be writable', meta.source === obj);
			if (!(keyName in meta.cache)) {
				// unwatch already creates meta for this instance
				removeDependentKeys(this, obj, keyName, meta);
			}
		};

		/* impl descriptor API */
		ComputedPropertyPrototype.didChange = function(obj, keyName) {
			// _suspended is set via a CP.set to ensure we don't clear
			// the cached value set by the setter
			if (this._cacheable && this._suspended !== obj) {
				var meta = metaFor(obj);
				if (keyName in meta.cache) {
					delete meta.cache[keyName];
					if (!meta.watching[keyName]) {
						removeDependentKeys(this, obj, keyName, meta);
					}
				}
			}
		};

		/* impl descriptor API */
		ComputedPropertyPrototype.get = function(obj, keyName) {
			var ret, cache, meta;
			if (this._cacheable) {
				meta = metaFor(obj);
				cache = meta.cache;
				if (keyName in cache) { return cache[keyName]; }
				ret = cache[keyName] = this.func.call(obj, keyName);
				if (!meta.watching[keyName]) {
					addDependentKeys(this, obj, keyName, meta);
				}
			} else {
				ret = this.func.call(obj, keyName);
			}
			return ret;
		};

		/* impl descriptor API */
		ComputedPropertyPrototype.set = function(obj, keyName, value) {
			var cacheable = this._cacheable,
				func = this.func,
				meta = metaFor(obj, cacheable),
				watched = meta.watching[keyName],
				oldSuspended = this._suspended,
				hadCachedValue = false,
				cache = meta.cache,
				cachedValue, ret;

			if (this._readOnly) {
				throw new Error('Cannot Set: ' + keyName + ' on: ' + obj.toString() );
			}

			this._suspended = obj;

			try {

				if (cacheable && cache.hasOwnProperty(keyName)) {
					cachedValue = cache[keyName];
					hadCachedValue = true;
				}

				// Check if the CP has been wrapped
				if (func.wrappedFunction) { func = func.wrappedFunction; }

				// For backwards-compatibility with computed properties
				// that check for arguments.length === 2 to determine if
				// they are being get or set, only pass the old cached
				// value if the computed property opts into a third
				// argument.
				if (func.length === 3) {
					ret = func.call(obj, keyName, value, cachedValue);
				} else if (func.length === 2) {
					ret = func.call(obj, keyName, value);
				} else {
					Ember.defineProperty(obj, keyName, null, cachedValue);
					Ember.set(obj, keyName, value);
					return;
				}

				if (hadCachedValue && cachedValue === ret) { return; }

				if (watched) { Ember.propertyWillChange(obj, keyName); }

				if (hadCachedValue) {
					delete cache[keyName];
				}

				if (cacheable) {
					if (!watched && !hadCachedValue) {
						addDependentKeys(this, obj, keyName, meta);
					}
					cache[keyName] = ret;
				}

				if (watched) { Ember.propertyDidChange(obj, keyName); }
			} finally {
				this._suspended = oldSuspended;
			}
			return ret;
		};

		/* called when property is defined */
		ComputedPropertyPrototype.setup = function(obj, keyName) {
			var meta = obj[META_KEY];
			if (meta && meta.watching[keyName]) {
				addDependentKeys(this, obj, keyName, metaFor(obj));
			}
		};

		/* called before property is overridden */
		ComputedPropertyPrototype.teardown = function(obj, keyName) {
			var meta = metaFor(obj);

			if (meta.watching[keyName] || keyName in meta.cache) {
				removeDependentKeys(this, obj, keyName, meta);
			}

			if (this._cacheable) { delete meta.cache[keyName]; }

			return null; // no value to restore
		};


		/**
		 This helper returns a new property descriptor that wraps the passed
		 computed property function. You can use this helper to define properties
		 with mixins or via `Ember.defineProperty()`.

		 The function you pass will be used to both get and set property values.
		 The function should accept two parameters, key and value. If value is not
		 undefined you should set the value first. In either case return the
		 current value of the property.

		 @method computed
		 @for Ember
		 @param {Function} func The computed property function.
		 @return {Ember.ComputedProperty} property descriptor instance
		 */
		Ember.computed = function(func) {
			var args;

			if (arguments.length > 1) {
				args = a_slice.call(arguments, 0, -1);
				func = a_slice.call(arguments, -1)[0];
			}

			if ( typeof func !== "function" ) {
				throw new Error("Computed Property declared without a property function");
			}

			var cp = new ComputedProperty(func);

			if (args) {
				cp.property.apply(cp, args);
			}

			return cp;
		};

		/**
		 Returns the cached value for a property, if one exists.
		 This can be useful for peeking at the value of a computed
		 property that is generated lazily, without accidentally causing
		 it to be created.

		 @method cacheFor
		 @for Ember
		 @param {Object} obj the object whose property you want to check
		 @param {String} key the name of the property whose cached value you want
		 to return
		 @return {any} the cached value
		 */
		Ember.cacheFor = function cacheFor(obj, key) {
			var cache = metaFor(obj, false).cache;

			if (cache && key in cache) {
				return cache[key];
			}
		};

		function getProperties(self, propertyNames) {
			var ret = {};
			for(var i = 0; i < propertyNames.length; i++) {
				ret[propertyNames[i]] = get(self, propertyNames[i]);
			}
			return ret;
		}

		function registerComputed(name, macro) {
			Ember.computed[name] = function(dependentKey) {
				var args = a_slice.call(arguments);
				return Ember.computed(dependentKey, function() {
					return macro.apply(this, args);
				});
			};
		}

		function registerComputedWithProperties(name, macro) {
			Ember.computed[name] = function() {
				var properties = a_slice.call(arguments);

				var computed = Ember.computed(function() {
					return macro.apply(this, [getProperties(this, properties)]);
				});

				return computed.property.apply(computed, properties);
			};
		}

		/**
		 @method computed.empty
		 @for Ember
		 @param {String} dependentKey
		 @return {Ember.ComputedProperty} computed property which negate
		 the original value for property
		 */
		registerComputed('empty', function(dependentKey) {
			return Ember.isEmpty(get(this, dependentKey));
		});

		/**
		 @method computed.notEmpty
		 @for Ember
		 @param {String} dependentKey
		 @return {Ember.ComputedProperty} computed property which returns true if
		 original value for property is not empty.
		 */
		registerComputed('notEmpty', function(dependentKey) {
			return !Ember.isEmpty(get(this, dependentKey));
		});

		/**
		 @method computed.none
		 @for Ember
		 @param {String} dependentKey
		 @return {Ember.ComputedProperty} computed property which
		 rturns true if original value for property is null or undefined.
		 */
		registerComputed('none', function(dependentKey) {
			return Ember.isNone(get(this, dependentKey));
		});

		/**
		 @method computed.not
		 @for Ember
		 @param {String} dependentKey
		 @return {Ember.ComputedProperty} computed property which returns
		 inverse of the original value for property
		 */
		registerComputed('not', function(dependentKey) {
			return !get(this, dependentKey);
		});

		/**
		 @method computed.bool
		 @for Ember
		 @param {String} dependentKey
		 @return {Ember.ComputedProperty} computed property which convert
		 to boolean the original value for property
		 */
		registerComputed('bool', function(dependentKey) {
			return !!get(this, dependentKey);
		});

		/**
		 @method computed.match
		 @for Ember
		 @param {String} dependentKey
		 @param {RegExp} regexp
		 @return {Ember.ComputedProperty} computed property which match
		 the original value for property against a given RegExp
		 */
		registerComputed('match', function(dependentKey, regexp) {
			var value = get(this, dependentKey);
			return typeof value === 'string' ? !!value.match(regexp) : false;
		});

		/**
		 @method computed.equal
		 @for Ember
		 @param {String} dependentKey
		 @param {String|Number|Object} value
		 @return {Ember.ComputedProperty} computed property which returns true if
		 the original value for property is equal to the given value.
		 */
		registerComputed('equal', function(dependentKey, value) {
			return get(this, dependentKey) === value;
		});

		/**
		 @method computed.gt
		 @for Ember
		 @param {String} dependentKey
		 @param {Number} value
		 @return {Ember.ComputedProperty} computed property which returns true if
		 the original value for property is greater then given value.
		 */
		registerComputed('gt', function(dependentKey, value) {
			return get(this, dependentKey) > value;
		});

		/**
		 @method computed.gte
		 @for Ember
		 @param {String} dependentKey
		 @param {Number} value
		 @return {Ember.ComputedProperty} computed property which returns true if
		 the original value for property is greater or equal then given value.
		 */
		registerComputed('gte', function(dependentKey, value) {
			return get(this, dependentKey) >= value;
		});

		/**
		 @method computed.lt
		 @for Ember
		 @param {String} dependentKey
		 @param {Number} value
		 @return {Ember.ComputedProperty} computed property which returns true if
		 the original value for property is less then given value.
		 */
		registerComputed('lt', function(dependentKey, value) {
			return get(this, dependentKey) < value;
		});

		/**
		 @method computed.lte
		 @for Ember
		 @param {String} dependentKey
		 @param {Number} value
		 @return {Ember.ComputedProperty} computed property which returns true if
		 the original value for property is less or equal then given value.
		 */
		registerComputed('lte', function(dependentKey, value) {
			return get(this, dependentKey) <= value;
		});

		/**
		 @method computed.and
		 @for Ember
		 @param {String} dependentKey, [dependentKey...]
		 @return {Ember.ComputedProperty} computed property which peforms
		 a logical `and` on the values of all the original values for properties.
		 */
		registerComputedWithProperties('and', function(properties) {
			for (var key in properties) {
				if (properties.hasOwnProperty(key) && !properties[key]) {
					return false;
				}
			}
			return true;
		});

		/**
		 @method computed.or
		 @for Ember
		 @param {String} dependentKey, [dependentKey...]
		 @return {Ember.ComputedProperty} computed property which peforms
		 a logical `or` on the values of all the original values for properties.
		 */
		registerComputedWithProperties('or', function(properties) {
			for (var key in properties) {
				if (properties.hasOwnProperty(key) && properties[key]) {
					return true;
				}
			}
			return false;
		});

		/**
		 @method computed.any
		 @for Ember
		 @param {String} dependentKey, [dependentKey...]
		 @return {Ember.ComputedProperty} computed property which returns
		 the first trouthy value of given list of properties.
		 */
		registerComputedWithProperties('any', function(properties) {
			for (var key in properties) {
				if (properties.hasOwnProperty(key) && properties[key]) {
					return properties[key];
				}
			}
			return null;
		});

		/**
		 @method computed.map
		 @for Ember
		 @param {String} dependentKey, [dependentKey...]
		 @return {Ember.ComputedProperty} computed property which maps
		 values of all passed properties in to an array.
		 */
		registerComputedWithProperties('map', function(properties) {
			var res = [];
			for (var key in properties) {
				if (properties.hasOwnProperty(key)) {
					if (Ember.isNone(properties[key])) {
						res.push(null);
					} else {
						res.push(properties[key]);
					}
				}
			}
			return res;
		});

		/**
		 @method computed.alias
		 @for Ember
		 @param {String} dependentKey
		 @return {Ember.ComputedProperty} computed property which creates an
		 alias to the original value for property.
		 */
		Ember.computed.alias = function(dependentKey) {
			return Ember.computed(dependentKey, function(key, value){
				if (arguments.length > 1) {
					set(this, dependentKey, value);
					return value;
				} else {
					return get(this, dependentKey);
				}
			});
		};

		/**
		 @method computed.defaultTo
		 @for Ember
		 @param {String} defaultPath
		 @return {Ember.ComputedProperty} computed property which acts like
		 a standard getter and setter, but defaults to the value from `defaultPath`.
		 */
		Ember.computed.defaultTo = function(defaultPath) {
			return Ember.computed(function(key, newValue, cachedValue) {
				var result;
				if (arguments.length === 1) {
					return cachedValue != null ? cachedValue : get(this, defaultPath);
				}
				return newValue != null ? newValue : get(this, defaultPath);
			});
		};

	})();



	(function() {
		/**
		 @module ember-metal
		 */

		var o_create = Ember.create,
			metaFor = Ember.meta,
			META_KEY = Ember.META_KEY;

		/*
		 The event system uses a series of nested hashes to store listeners on an
		 object. When a listener is registered, or when an event arrives, these
		 hashes are consulted to determine which target and action pair to invoke.

		 The hashes are stored in the object's meta hash, and look like this:

		 // Object's meta hash
		 {
		 listeners: {       // variable name: `listenerSet`
		 "foo:changed": [ // variable name: `actions`
		 [target, method, onceFlag, suspendedFlag]
		 ]
		 }
		 }

		 */

		function indexOf(array, target, method) {
			var index = -1;
			for (var i = 0, l = array.length; i < l; i++) {
				if (target === array[i][0] && method === array[i][1]) { index = i; break; }
			}
			return index;
		}

		function actionsFor(obj, eventName) {
			var meta = metaFor(obj, true),
				actions;

			if (!meta.listeners) { meta.listeners = {}; }

			if (!meta.hasOwnProperty('listeners')) {
				// setup inherited copy of the listeners object
				meta.listeners = o_create(meta.listeners);
			}

			actions = meta.listeners[eventName];

			// if there are actions, but the eventName doesn't exist in our listeners, then copy them from the prototype
			if (actions && !meta.listeners.hasOwnProperty(eventName)) {
				actions = meta.listeners[eventName] = meta.listeners[eventName].slice();
			} else if (!actions) {
				actions = meta.listeners[eventName] = [];
			}

			return actions;
		}

		function actionsUnion(obj, eventName, otherActions) {
			var meta = obj[META_KEY],
				actions = meta && meta.listeners && meta.listeners[eventName];

			if (!actions) { return; }
			for (var i = actions.length - 1; i >= 0; i--) {
				var target = actions[i][0],
					method = actions[i][1],
					once = actions[i][2],
					suspended = actions[i][3],
					actionIndex = indexOf(otherActions, target, method);

				if (actionIndex === -1) {
					otherActions.push([target, method, once, suspended]);
				}
			}
		}

		function actionsDiff(obj, eventName, otherActions) {
			var meta = obj[META_KEY],
				actions = meta && meta.listeners && meta.listeners[eventName],
				diffActions = [];

			if (!actions) { return; }
			for (var i = actions.length - 1; i >= 0; i--) {
				var target = actions[i][0],
					method = actions[i][1],
					once = actions[i][2],
					suspended = actions[i][3],
					actionIndex = indexOf(otherActions, target, method);

				if (actionIndex !== -1) { continue; }

				otherActions.push([target, method, once, suspended]);
				diffActions.push([target, method, once, suspended]);
			}

			return diffActions;
		}

		/**
		 Add an event listener

		 @method addListener
		 @for Ember
		 @param obj
		 @param {String} eventName
		 @param {Object|Function} targetOrMethod A target object or a function
		 @param {Function|String} method A function or the name of a function to be called on `target`
		 @param {Boolean} once A flag whether a function should only be called once
		 */
		function addListener(obj, eventName, target, method, once) {
			Ember.assert("You must pass at least an object and event name to Ember.addListener", !!obj && !!eventName);

			if (!method && 'function' === typeof target) {
				method = target;
				target = null;
			}

			var actions = actionsFor(obj, eventName),
				actionIndex = indexOf(actions, target, method);

			if (actionIndex !== -1) { return; }

			actions.push([target, method, once, undefined]);

			if ('function' === typeof obj.didAddListener) {
				obj.didAddListener(eventName, target, method);
			}
		}

		/**
		 Remove an event listener

		 Arguments should match those passed to {{#crossLink "Ember/addListener"}}{{/crossLink}}

		 @method removeListener
		 @for Ember
		 @param obj
		 @param {String} eventName
		 @param {Object|Function} targetOrMethod A target object or a function
		 @param {Function|String} method A function or the name of a function to be called on `target`
		 */
		function removeListener(obj, eventName, target, method) {
			Ember.assert("You must pass at least an object and event name to Ember.removeListener", !!obj && !!eventName);

			if (!method && 'function' === typeof target) {
				method = target;
				target = null;
			}

			function _removeListener(target, method, once) {
				var actions = actionsFor(obj, eventName),
					actionIndex = indexOf(actions, target, method);

				// action doesn't exist, give up silently
				if (actionIndex === -1) { return; }

				actions.splice(actionIndex, 1);

				if ('function' === typeof obj.didRemoveListener) {
					obj.didRemoveListener(eventName, target, method);
				}
			}

			if (method) {
				_removeListener(target, method);
			} else {
				var meta = obj[META_KEY],
					actions = meta && meta.listeners && meta.listeners[eventName];

				if (!actions) { return; }
				for (var i = actions.length - 1; i >= 0; i--) {
					_removeListener(actions[i][0], actions[i][1]);
				}
			}
		}

		/**
		 @private

		 Suspend listener during callback.

		 This should only be used by the target of the event listener
		 when it is taking an action that would cause the event, e.g.
		 an object might suspend its property change listener while it is
		 setting that property.

		 @method suspendListener
		 @for Ember
		 @param obj
		 @param {String} eventName
		 @param {Object|Function} targetOrMethod A target object or a function
		 @param {Function|String} method A function or the name of a function to be called on `target`
		 @param {Function} callback
		 */
		function suspendListener(obj, eventName, target, method, callback) {
			if (!method && 'function' === typeof target) {
				method = target;
				target = null;
			}

			var actions = actionsFor(obj, eventName),
				actionIndex = indexOf(actions, target, method),
				action;

			if (actionIndex !== -1) {
				action = actions[actionIndex].slice(); // copy it, otherwise we're modifying a shared object
				action[3] = true; // mark the action as suspended
				actions[actionIndex] = action; // replace the shared object with our copy
			}

			function tryable()   { return callback.call(target); }
			function finalizer() { if (action) { action[3] = undefined; } }

			return Ember.tryFinally(tryable, finalizer);
		}

		/**
		 @private

		 Suspend listener during callback.

		 This should only be used by the target of the event listener
		 when it is taking an action that would cause the event, e.g.
		 an object might suspend its property change listener while it is
		 setting that property.

		 @method suspendListener
		 @for Ember
		 @param obj
		 @param {Array} eventName Array of event names
		 @param {Object|Function} targetOrMethod A target object or a function
		 @param {Function|String} method A function or the name of a function to be called on `target`
		 @param {Function} callback
		 */
		function suspendListeners(obj, eventNames, target, method, callback) {
			if (!method && 'function' === typeof target) {
				method = target;
				target = null;
			}

			var suspendedActions = [],
				eventName, actions, action, i, l;

			for (i=0, l=eventNames.length; i<l; i++) {
				eventName = eventNames[i];
				actions = actionsFor(obj, eventName);
				var actionIndex = indexOf(actions, target, method);

				if (actionIndex !== -1) {
					action = actions[actionIndex].slice();
					action[3] = true;
					actions[actionIndex] = action;
					suspendedActions.push(action);
				}
			}

			function tryable() { return callback.call(target); }

			function finalizer() {
				for (i = 0, l = suspendedActions.length; i < l; i++) {
					suspendedActions[i][3] = undefined;
				}
			}

			return Ember.tryFinally(tryable, finalizer);
		}

		/**
		 @private

		 Return a list of currently watched events

		 @method watchedEvents
		 @for Ember
		 @param obj
		 */
		function watchedEvents(obj) {
			var listeners = obj[META_KEY].listeners, ret = [];

			if (listeners) {
				for(var eventName in listeners) {
					if (listeners[eventName]) { ret.push(eventName); }
				}
			}
			return ret;
		}

		/**
		 @method sendEvent
		 @for Ember
		 @param obj
		 @param {String} eventName
		 @param {Array} params
		 @param {Array} actions
		 @return true
		 */
		function sendEvent(obj, eventName, params, actions) {
			// first give object a chance to handle it
			if (obj !== Ember && 'function' === typeof obj.sendEvent) {
				obj.sendEvent(eventName, params);
			}

			if (!actions) {
				var meta = obj[META_KEY];
				actions = meta && meta.listeners && meta.listeners[eventName];
			}

			if (!actions) { return; }

			for (var i = actions.length - 1; i >= 0; i--) { // looping in reverse for once listeners
				if (!actions[i] || actions[i][3] === true) { continue; }

				var target = actions[i][0],
					method = actions[i][1],
					once = actions[i][2];

				if (once) { removeListener(obj, eventName, target, method); }
				if (!target) { target = obj; }
				if ('string' === typeof method) { method = target[method]; }
				if (params) {
					method.apply(target, params);
				} else {
					method.call(target);
				}
			}
			return true;
		}

		/**
		 @private
		 @method hasListeners
		 @for Ember
		 @param obj
		 @param {String} eventName
		 */
		function hasListeners(obj, eventName) {
			var meta = obj[META_KEY],
				actions = meta && meta.listeners && meta.listeners[eventName];

			return !!(actions && actions.length);
		}

		/**
		 @private
		 @method listenersFor
		 @for Ember
		 @param obj
		 @param {String} eventName
		 */
		function listenersFor(obj, eventName) {
			var ret = [];
			var meta = obj[META_KEY],
				actions = meta && meta.listeners && meta.listeners[eventName];

			if (!actions) { return ret; }

			for (var i = 0, l = actions.length; i < l; i++) {
				var target = actions[i][0],
					method = actions[i][1];
				ret.push([target, method]);
			}

			return ret;
		}

		Ember.addListener = addListener;
		Ember.removeListener = removeListener;
		Ember._suspendListener = suspendListener;
		Ember._suspendListeners = suspendListeners;
		Ember.sendEvent = sendEvent;
		Ember.hasListeners = hasListeners;
		Ember.watchedEvents = watchedEvents;
		Ember.listenersFor = listenersFor;
		Ember.listenersDiff = actionsDiff;
		Ember.listenersUnion = actionsUnion;

	})();



	(function() {
// Ember.Logger
// Ember.watch.flushPending
// Ember.beginPropertyChanges, Ember.endPropertyChanges
// Ember.guidFor, Ember.tryFinally

		/**
		 @module ember-metal
		 */

// ..........................................................
// HELPERS
//

		var slice = [].slice,
			forEach = Ember.ArrayPolyfills.forEach;

// invokes passed params - normalizing so you can pass target/func,
// target/string or just func
		function invoke(target, method, args, ignore) {

			if (method === undefined) {
				method = target;
				target = undefined;
			}

			if ('string' === typeof method) { method = target[method]; }
			if (args && ignore > 0) {
				args = args.length > ignore ? slice.call(args, ignore) : null;
			}

			return Ember.handleErrors(function() {
				// IE8's Function.prototype.apply doesn't accept undefined/null arguments.
				return method.apply(target || this, args || []);
			}, this);
		}


// ..........................................................
// RUNLOOP
//

		var timerMark; // used by timers...

		/**
		 Ember RunLoop (Private)

		 @class RunLoop
		 @namespace Ember
		 @private
		 @constructor
		 */
		var RunLoop = function(prev) {
			this._prev = prev || null;
			this.onceTimers = {};
		};

		RunLoop.prototype = {
			/**
			 @method end
			 */
			end: function() {
				this.flush();
			},

			/**
			 @method prev
			 */
			prev: function() {
				return this._prev;
			},

			// ..........................................................
			// Delayed Actions
			//

			/**
			 @method schedule
			 @param {String} queueName
			 @param target
			 @param method
			 */
			schedule: function(queueName, target, method) {
				var queues = this._queues, queue;
				if (!queues) { queues = this._queues = {}; }
				queue = queues[queueName];
				if (!queue) { queue = queues[queueName] = []; }

				var args = arguments.length > 3 ? slice.call(arguments, 3) : null;
				queue.push({ target: target, method: method, args: args });
				return this;
			},

			/**
			 @method flush
			 @param {String} queueName
			 */
			flush: function(queueName) {
				var queueNames, idx, len, queue, log;

				if (!this._queues) { return this; } // nothing to do

				function iter(item) {
					invoke(item.target, item.method, item.args);
				}

				function tryable() {
					forEach.call(queue, iter);
				}

				Ember.watch.flushPending(); // make sure all chained watchers are setup

				if (queueName) {
					while (this._queues && (queue = this._queues[queueName])) {
						this._queues[queueName] = null;

						// the sync phase is to allow property changes to propagate. don't
						// invoke observers until that is finished.
						if (queueName === 'sync') {
							log = Ember.LOG_BINDINGS;
							if (log) { Ember.Logger.log('Begin: Flush Sync Queue'); }

							Ember.beginPropertyChanges();

							Ember.tryFinally(tryable, Ember.endPropertyChanges);

							if (log) { Ember.Logger.log('End: Flush Sync Queue'); }

						} else {
							forEach.call(queue, iter);
						}
					}

				} else {
					queueNames = Ember.run.queues;
					len = queueNames.length;
					idx = 0;

					outerloop:
						while (idx < len) {
							queueName = queueNames[idx];
							queue = this._queues && this._queues[queueName];
							delete this._queues[queueName];

							if (queue) {
								// the sync phase is to allow property changes to propagate. don't
								// invoke observers until that is finished.
								if (queueName === 'sync') {
									log = Ember.LOG_BINDINGS;
									if (log) { Ember.Logger.log('Begin: Flush Sync Queue'); }

									Ember.beginPropertyChanges();

									Ember.tryFinally(tryable, Ember.endPropertyChanges);

									if (log) { Ember.Logger.log('End: Flush Sync Queue'); }
								} else {
									forEach.call(queue, iter);
								}
							}

							// Loop through prior queues
							for (var i = 0; i <= idx; i++) {
								if (this._queues && this._queues[queueNames[i]]) {
									// Start over at the first queue with contents
									idx = i;
									continue outerloop;
								}
							}

							idx++;
						}
				}

				timerMark = null;

				return this;
			}

		};

		Ember.RunLoop = RunLoop;

// ..........................................................
// Ember.run - this is ideally the only public API the dev sees
//

		/**
		 Runs the passed target and method inside of a RunLoop, ensuring any
		 deferred actions including bindings and views updates are flushed at the
		 end.

		 Normally you should not need to invoke this method yourself. However if
		 you are implementing raw event handlers when interfacing with other
		 libraries or plugins, you should probably wrap all of your code inside this
		 call.

		 ```javascript
		 Ember.run(function(){
    // code to be execute within a RunLoop
  });
		 ```

		 @class run
		 @namespace Ember
		 @static
		 @constructor
		 @param {Object} [target] target of method to call
		 @param {Function|String} method Method to invoke.
		 May be a function or a string. If you pass a string
		 then it will be looked up on the passed target.
		 @param {Object} [args*] Any additional arguments you wish to pass to the method.
		 @return {Object} return value from invoking the passed function.
		 */
		Ember.run = function(target, method) {
			var args = arguments;
			run.begin();

			function tryable() {
				if (target || method) {
					return invoke(target, method, args, 2);
				}
			}

			return Ember.tryFinally(tryable, run.end);
		};

		var run = Ember.run;


		/**
		 Begins a new RunLoop. Any deferred actions invoked after the begin will
		 be buffered until you invoke a matching call to `Ember.run.end()`. This is
		 a lower-level way to use a RunLoop instead of using `Ember.run()`.

		 ```javascript
		 Ember.run.begin();
		 // code to be execute within a RunLoop
		 Ember.run.end();
		 ```

		 @method begin
		 @return {void}
		 */
		Ember.run.begin = function() {
			run.currentRunLoop = new RunLoop(run.currentRunLoop);
		};

		/**
		 Ends a RunLoop. This must be called sometime after you call
		 `Ember.run.begin()` to flush any deferred actions. This is a lower-level way
		 to use a RunLoop instead of using `Ember.run()`.

		 ```javascript
		 Ember.run.begin();
		 // code to be execute within a RunLoop
		 Ember.run.end();
		 ```

		 @method end
		 @return {void}
		 */
		Ember.run.end = function() {
			Ember.assert('must have a current run loop', run.currentRunLoop);

			function tryable()   { run.currentRunLoop.end();  }
			function finalizer() { run.currentRunLoop = run.currentRunLoop.prev(); }

			Ember.tryFinally(tryable, finalizer);
		};

		/**
		 Array of named queues. This array determines the order in which queues
		 are flushed at the end of the RunLoop. You can define your own queues by
		 simply adding the queue name to this array. Normally you should not need
		 to inspect or modify this property.

		 @property queues
		 @type Array
		 @default ['sync', 'actions', 'destroy']
		 */
		Ember.run.queues = ['sync', 'actions', 'destroy'];

		/**
		 Adds the passed target/method and any optional arguments to the named
		 queue to be executed at the end of the RunLoop. If you have not already
		 started a RunLoop when calling this method one will be started for you
		 automatically.

		 At the end of a RunLoop, any methods scheduled in this way will be invoked.
		 Methods will be invoked in an order matching the named queues defined in
		 the `run.queues` property.

		 ```javascript
		 Ember.run.schedule('sync', this, function(){
    // this will be executed in the first RunLoop queue, when bindings are synced
    console.log("scheduled on sync queue");
  });

		 Ember.run.schedule('actions', this, function(){
    // this will be executed in the 'actions' queue, after bindings have synced.
    console.log("scheduled on actions queue");
  });

		 // Note the functions will be run in order based on the run queues order. Output would be:
		 //   scheduled on sync queue
		 //   scheduled on actions queue
		 ```

		 @method schedule
		 @param {String} queue The name of the queue to schedule against.
		 Default queues are 'sync' and 'actions'
		 @param {Object} [target] target object to use as the context when invoking a method.
		 @param {String|Function} method The method to invoke. If you pass a string it
		 will be resolved on the target object at the time the scheduled item is
		 invoked allowing you to change the target function.
		 @param {Object} [arguments*] Optional arguments to be passed to the queued method.
		 @return {void}
		 */
		Ember.run.schedule = function(queue, target, method) {
			var loop = run.autorun();
			loop.schedule.apply(loop, arguments);
		};

		var scheduledAutorun;
		function autorun() {
			scheduledAutorun = null;
			if (run.currentRunLoop) { run.end(); }
		}

// Used by global test teardown
		Ember.run.hasScheduledTimers = function() {
			return !!(scheduledAutorun || scheduledLater);
		};

// Used by global test teardown
		Ember.run.cancelTimers = function () {
			if (scheduledAutorun) {
				clearTimeout(scheduledAutorun);
				scheduledAutorun = null;
			}
			if (scheduledLater) {
				clearTimeout(scheduledLater);
				scheduledLater = null;
			}
			timers = {};
		};

		/**
		 Begins a new RunLoop if necessary and schedules a timer to flush the
		 RunLoop at a later time. This method is used by parts of Ember to
		 ensure the RunLoop always finishes. You normally do not need to call this
		 method directly. Instead use `Ember.run()`

		 @method autorun
		 @example
		 Ember.run.autorun();
		 @return {Ember.RunLoop} the new current RunLoop
		 */
		Ember.run.autorun = function() {
			if (!run.currentRunLoop) {
				Ember.assert("You have turned on testing mode, which disabled the run-loop's autorun. You will need to wrap any code with asynchronous side-effects in an Ember.run", !Ember.testing);

				run.begin();

				if (!scheduledAutorun) {
					scheduledAutorun = setTimeout(autorun, 1);
				}
			}

			return run.currentRunLoop;
		};

		/**
		 Immediately flushes any events scheduled in the 'sync' queue. Bindings
		 use this queue so this method is a useful way to immediately force all
		 bindings in the application to sync.

		 You should call this method anytime you need any changed state to propagate
		 throughout the app immediately without repainting the UI (which happens
		 in the later 'render' queue added by the `ember-views` package).

		 ```javascript
		 Ember.run.sync();
		 ```

		 @method sync
		 @return {void}
		 */
		Ember.run.sync = function() {
			run.autorun();
			run.currentRunLoop.flush('sync');
		};

// ..........................................................
// TIMERS
//

		var timers = {}; // active timers...

		var scheduledLater, scheduledLaterExpires;
		function invokeLaterTimers() {
			scheduledLater = null;
			run(function() {
				var now = (+ new Date()), earliest = -1;
				for (var key in timers) {
					if (!timers.hasOwnProperty(key)) { continue; }
					var timer = timers[key];
					if (timer && timer.expires) {
						if (now >= timer.expires) {
							delete timers[key];
							invoke(timer.target, timer.method, timer.args, 2);
						} else {
							if (earliest < 0 || (timer.expires < earliest)) { earliest = timer.expires; }
						}
					}
				}

				// schedule next timeout to fire when the earliest timer expires
				if (earliest > 0) {
					scheduledLater = setTimeout(invokeLaterTimers, earliest - now);
					scheduledLaterExpires = earliest;
				}
			});
		}

		/**
		 Invokes the passed target/method and optional arguments after a specified
		 period if time. The last parameter of this method must always be a number
		 of milliseconds.

		 You should use this method whenever you need to run some action after a
		 period of time instead of using `setTimeout()`. This method will ensure that
		 items that expire during the same script execution cycle all execute
		 together, which is often more efficient than using a real setTimeout.

		 ```javascript
		 Ember.run.later(myContext, function(){
    // code here will execute within a RunLoop in about 500ms with this == myContext
  }, 500);
		 ```

		 @method later
		 @param {Object} [target] target of method to invoke
		 @param {Function|String} method The method to invoke.
		 If you pass a string it will be resolved on the
		 target at the time the method is invoked.
		 @param {Object} [args*] Optional arguments to pass to the timeout.
		 @param {Number} wait Number of milliseconds to wait.
		 @return {String} a string you can use to cancel the timer in
		 {{#crossLink "Ember/run.cancel"}}{{/crossLink}} later.
		 */
		Ember.run.later = function(target, method) {
			var args, expires, timer, guid, wait;

			// setTimeout compatibility...
			if (arguments.length===2 && 'function' === typeof target) {
				wait   = method;
				method = target;
				target = undefined;
				args   = [target, method];
			} else {
				args = slice.call(arguments);
				wait = args.pop();
			}

			expires = (+ new Date()) + wait;
			timer   = { target: target, method: method, expires: expires, args: args };
			guid    = Ember.guidFor(timer);
			timers[guid] = timer;

			if(scheduledLater && expires < scheduledLaterExpires) {
				// Cancel later timer (then reschedule earlier timer below)
				clearTimeout(scheduledLater);
				scheduledLater = null;
			}

			if (!scheduledLater) {
				// Schedule later timers to be run.
				scheduledLater = setTimeout(invokeLaterTimers, wait);
				scheduledLaterExpires = expires;
			}

			return guid;
		};

		function invokeOnceTimer(guid, onceTimers) {
			if (onceTimers[this.tguid]) { delete onceTimers[this.tguid][this.mguid]; }
			if (timers[guid]) { invoke(this.target, this.method, this.args); }
			delete timers[guid];
		}

		function scheduleOnce(queue, target, method, args) {
			var tguid = Ember.guidFor(target),
				mguid = Ember.guidFor(method),
				onceTimers = run.autorun().onceTimers,
				guid = onceTimers[tguid] && onceTimers[tguid][mguid],
				timer;

			if (guid && timers[guid]) {
				timers[guid].args = args; // replace args
			} else {
				timer = {
					target: target,
					method: method,
					args:   args,
					tguid:  tguid,
					mguid:  mguid
				};

				guid  = Ember.guidFor(timer);
				timers[guid] = timer;
				if (!onceTimers[tguid]) { onceTimers[tguid] = {}; }
				onceTimers[tguid][mguid] = guid; // so it isn't scheduled more than once

				run.schedule(queue, timer, invokeOnceTimer, guid, onceTimers);
			}

			return guid;
		}

		/**
		 Schedules an item to run one time during the current RunLoop. Calling
		 this method with the same target/method combination will have no effect.

		 Note that although you can pass optional arguments these will not be
		 considered when looking for duplicates. New arguments will replace previous
		 calls.

		 ```javascript
		 Ember.run(function(){
    var doFoo = function() { foo(); }
    Ember.run.once(myContext, doFoo);
    Ember.run.once(myContext, doFoo);
    // doFoo will only be executed once at the end of the RunLoop
  });
		 ```

		 Also note that passing an anonymous function to `Ember.run.once` will
		 not prevent additional calls with an identical anonymous function from
		 scheduling the items multiple times, e.g.:

		 ```javascript
		 function scheduleIt() {
    Ember.run.once(myContext, function() { console.log("Closure"); });
  }
		 scheduleIt();
		 scheduleIt();
		 // "Closure" will print twice, even though we're using `Ember.run.once`,
		 // because the function we pass to it is anonymous and won't match the
		 // previously scheduled operation.
		 ```

		 @method once
		 @param {Object} [target] target of method to invoke
		 @param {Function|String} method The method to invoke.
		 If you pass a string it will be resolved on the
		 target at the time the method is invoked.
		 @param {Object} [args*] Optional arguments to pass to the timeout.
		 @return {Object} timer
		 */
		Ember.run.once = function(target, method) {
			return scheduleOnce('actions', target, method, slice.call(arguments, 2));
		};

		Ember.run.scheduleOnce = function(queue, target, method, args) {
			return scheduleOnce(queue, target, method, slice.call(arguments, 3));
		};

		/**
		 Schedules an item to run from within a separate run loop, after
		 control has been returned to the system. This is equivalent to calling
		 `Ember.run.later` with a wait time of 1ms.

		 ```javascript
		 Ember.run.next(myContext, function(){
    // code to be executed in the next run loop, which will be scheduled after the current one
  });
		 ```

		 Multiple operations scheduled with `Ember.run.next` will coalesce
		 into the same later run loop, along with any other operations
		 scheduled by `Ember.run.later` that expire right around the same
		 time that `Ember.run.next` operations will fire.

		 Note that there are often alternatives to using `Ember.run.next`.
		 For instance, if you'd like to schedule an operation to happen
		 after all DOM element operations have completed within the current
		 run loop, you can make use of the `afterRender` run loop queue (added
		 by the `ember-views` package, along with the preceding `render` queue
		 where all the DOM element operations happen). Example:

		 ```javascript
		 App.MyCollectionView = Ember.CollectionView.extend({
    didInsertElement: function() {
      Ember.run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    processChildElements: function() {
      // ... do something with collectionView's child view
      // elements after they've finished rendering, which
      // can't be done within the CollectionView's
      // `didInsertElement` hook because that gets run
      // before the child elements have been added to the DOM.
    }
  });
		 ```

		 One benefit of the above approach compared to using `Ember.run.next` is
		 that you will be able to perform DOM/CSS operations before unprocessed
		 elements are rendered to the screen, which may prevent flickering or
		 other artifacts caused by delaying processing until after rendering.

		 The other major benefit to the above approach is that `Ember.run.next`
		 introduces an element of non-determinism, which can make things much
		 harder to test, due to its reliance on `setTimeout`; it's much harder
		 to guarantee the order of scheduled operations when they are scheduled
		 outside of the current run loop, i.e. with `Ember.run.next`.

		 @method next
		 @param {Object} [target] target of method to invoke
		 @param {Function|String} method The method to invoke.
		 If you pass a string it will be resolved on the
		 target at the time the method is invoked.
		 @param {Object} [args*] Optional arguments to pass to the timeout.
		 @return {Object} timer
		 */
		Ember.run.next = function() {
			var args = slice.call(arguments);
			args.push(1); // 1 millisecond wait
			return run.later.apply(this, args);
		};

		/**
		 Cancels a scheduled item. Must be a value returned by `Ember.run.later()`,
		 `Ember.run.once()`, or `Ember.run.next()`.

		 ```javascript
		 var runNext = Ember.run.next(myContext, function(){
    // will not be executed
  });
		 Ember.run.cancel(runNext);

		 var runLater = Ember.run.later(myContext, function(){
    // will not be executed
  }, 500);
		 Ember.run.cancel(runLater);

		 var runOnce = Ember.run.once(myContext, function(){
    // will not be executed
  });
		 Ember.run.cancel(runOnce);
		 ```

		 @method cancel
		 @param {Object} timer Timer object to cancel
		 @return {void}
		 */
		Ember.run.cancel = function(timer) {
			delete timers[timer];
		};

	})();



	(function() {
// Ember.Logger
// get, set, trySet
// guidFor, isArray, meta
// addObserver, removeObserver
// Ember.run.schedule
		/**
		 @module ember-metal
		 */

// ..........................................................
// CONSTANTS
//

		/**
		 Debug parameter you can turn on. This will log all bindings that fire to
		 the console. This should be disabled in production code. Note that you
		 can also enable this from the console or temporarily.

		 @property LOG_BINDINGS
		 @for Ember
		 @type Boolean
		 @default false
		 */
		Ember.LOG_BINDINGS = false || !!Ember.ENV.LOG_BINDINGS;

		var get     = Ember.get,
			set     = Ember.set,
			guidFor = Ember.guidFor,
			isGlobalPath = Ember.isGlobalPath;


		function getWithGlobals(obj, path) {
			return get(isGlobalPath(path) ? Ember.lookup : obj, path);
		}

// ..........................................................
// BINDING
//

		var Binding = function(toPath, fromPath) {
			this._direction = 'fwd';
			this._from = fromPath;
			this._to   = toPath;
			this._directionMap = Ember.Map.create();
		};

		/**
		 @class Binding
		 @namespace Ember
		 */

		Binding.prototype = {
			/**
			 This copies the Binding so it can be connected to another object.

			 @method copy
			 @return {Ember.Binding}
			 */
			copy: function () {
				var copy = new Binding(this._to, this._from);
				if (this._oneWay) { copy._oneWay = true; }
				return copy;
			},

			// ..........................................................
			// CONFIG
			//

			/**
			 This will set `from` property path to the specified value. It will not
			 attempt to resolve this property path to an actual object until you
			 connect the binding.

			 The binding will search for the property path starting at the root object
			 you pass when you `connect()` the binding. It follows the same rules as
			 `get()` - see that method for more information.

			 @method from
			 @param {String} path the property path to connect to
			 @return {Ember.Binding} `this`
			 */
			from: function(path) {
				this._from = path;
				return this;
			},

			/**
			 This will set the `to` property path to the specified value. It will not
			 attempt to resolve this property path to an actual object until you
			 connect the binding.

			 The binding will search for the property path starting at the root object
			 you pass when you `connect()` the binding. It follows the same rules as
			 `get()` - see that method for more information.

			 @method to
			 @param {String|Tuple} path A property path or tuple
			 @return {Ember.Binding} `this`
			 */
			to: function(path) {
				this._to = path;
				return this;
			},

			/**
			 Configures the binding as one way. A one-way binding will relay changes
			 on the `from` side to the `to` side, but not the other way around. This
			 means that if you change the `to` side directly, the `from` side may have
			 a different value.

			 @method oneWay
			 @return {Ember.Binding} `this`
			 */
			oneWay: function() {
				this._oneWay = true;
				return this;
			},

			/**
			 @method toString
			 @return {String} string representation of binding
			 */
			toString: function() {
				var oneWay = this._oneWay ? '[oneWay]' : '';
				return "Ember.Binding<" + guidFor(this) + ">(" + this._from + " -> " + this._to + ")" + oneWay;
			},

			// ..........................................................
			// CONNECT AND SYNC
			//

			/**
			 Attempts to connect this binding instance so that it can receive and relay
			 changes. This method will raise an exception if you have not set the
			 from/to properties yet.

			 @method connect
			 @param {Object} obj The root object for this binding.
			 @return {Ember.Binding} `this`
			 */
			connect: function(obj) {
				Ember.assert('Must pass a valid object to Ember.Binding.connect()', !!obj);

				var fromPath = this._from, toPath = this._to;
				Ember.trySet(obj, toPath, getWithGlobals(obj, fromPath));

				// add an observer on the object to be notified when the binding should be updated
				Ember.addObserver(obj, fromPath, this, this.fromDidChange);

				// if the binding is a two-way binding, also set up an observer on the target
				if (!this._oneWay) { Ember.addObserver(obj, toPath, this, this.toDidChange); }

				this._readyToSync = true;

				return this;
			},

/**
 Disconnects the binding instance. Changes will no longer be relayed. You
 will not usually need to call this method.

 @method disconnect
 @param {Ob
