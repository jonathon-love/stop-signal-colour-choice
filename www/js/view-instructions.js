
$.widget( "ss.viewInstructions", $.ss.task, {

    options: {
        trialNo: 0,
        instructions : [],
        loaded: [],
        blockNo: 0,
        nBlocks: 10000,
        meanRT: null,
        accuracy: null
    },

    // the constructor
    _create: function() {

        $.ss.task.prototype._create.call(this)

        this.element.addClass("ss-view-instructions")

        this.textElement = $('<div class="instructions"></div>')
        this.element.append(this.textElement)
        this._refresh()

        var self = this
    },

    setText: function(what, text) {

        this.textElement.find(what).text(text)

    },

    _loaded: function() {

        $(".block-number").text(this.options.blockNo);
        $(".blocks-to-go").text(this.options.nBlocks - this.options.blockNo);
        $(".accuracy").text(this.options.accuracy);
        $(".mean-rt").text(this.options.meanRT);

        this._trigger("loaded");
    },

    _keyPress: function(event, char) {
        if (char == ' ')
            this.option("trialNo", this.options.trialNo + 1)
    },

    // called when created, and later when changing options
    _refresh: function() {
        if (this.options.trialNo < this.options.instructions.length) {

            var self = this

            this.textElement.html('\
<div class="message instructions"> \
    <div class="loading-indicator"></div> \
    <p>Loading...</p> \
</div>')

            this.textElement.load(this.options.instructions[this.options.trialNo], function() { self._loaded(); })
        }
        else {
            this._trigger("completed")
        }
    },

    // events bound via _bind are removed automatically
    // revert other modifications here
    destroy: function() {

        $.ss.task.prototype.destroy.call(this)

        this.element
            .removeClass( "ss-view-instructions" )
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
