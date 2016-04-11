
$.widget( "ss.submitData", $.ss.task, {

    options: {
        dataSync: null
    },

    // the constructor
    _create: function() {

        $.ss.task.prototype._create.call(this)

        var self = this

        this.element.addClass("ss-submit-data")
            .load("resources/submit-data.html", function() {
                self.retryButton = self.element.find(".retry-button")
                    .button()
                    .click(function() { self._send() } )
                self.message = self.element.find(".message")
                self.error   = self.element.find(".error")
                self.errorMessage = self.element.find(".error-message")

                self._send()
            })
    },

    _success: function() {
        this._trigger("completed")
    },

    _fail: function(e) {

        this.message.hide()
        this.errorMessage.html(e.statusText + " (" + e.status + ") <br>" + e.responseText)
        this.error.show()
    },

    _send: function() {

        this.error.hide()
        this.message.show()

        var self = this

        var jqxhr = this.options.dataSync.flush()

        setTimeout(function() {
            jqxhr.success(function() { self._success() } )
                .error(  function(e) { self._fail(e) })
        }, 1000)
    },

    // events bound via _bind are removed automatically
    // revert other modifications here
    destroy: function() {

        $.ss.task.prototype.destroy.call(this)

        this.element
            .removeClass( "ss-submit-data" )
            .empty()
    }
});
