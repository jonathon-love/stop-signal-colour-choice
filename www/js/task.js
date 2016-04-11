
$.widget( "ss.task", {
	
	options: {
		completed: []
	},

	// the constructor
	_create: function() {

		this.element.addClass("ss-task")
		//this.element.disableSelection()

		var self = this

		this._keyHandler = function(event) {

			if (event.keyCode == 191 || event.keyCode == 32)  // firefox hack
				event.preventDefault()

			var char
			if (event.keyCode == 191)
				char = '/'
			else
				char = String.fromCharCode(event.keyCode)

			self._keyPress(event, char)
		}
		
		$(window).bind("keydown", this._keyHandler)
	},
	
	_keyPress: function(event, char) {
	
	},

	// called when created, and later when changing options
	_refresh: function() {
		
	},

	// events bound via _bind are removed automatically
	// revert other modifications here
	destroy: function() {
		
		$(window).unbind("keydown", this._keyHandler)

		this.element
			.removeClass( "ss-task" )
			//.enableSelection()
			.empty()
	},

	// _setOptions is called with a hash of all options that are changing
	// always refresh when changing options
	_setOptions: function() {
		// in 1.9 would use _superApply
		$.Widget.prototype._setOptions.apply( this, arguments );
		this._refresh();
	},

	// _setOption is called for each individual option that is changing
	_setOption: function( key, value ) {
		
		// in 1.9 would use _super
		$.Widget.prototype._setOption.call( this, key, value );
	}
});
