
$.widget( "ss.goTask", $.ss.task, {

    options: {
        trialNo: 0,
        iti: 250,
        bt : 500,
        bci : 250,
        ct : 250,
        cti: 250,
        timeout: 2000,
        feedbackTime: 500,
        target: "left",
        trialData : [ ],
        rightKey: "/",
        leftKey:  "Z",
        completed: [ ]
    },

    // the constructor
    _create: function() {

        $.ss.task.prototype._create.call(this)

        var self = this

        this.step = 0
        this.timer = null
        this.startTime = null
        this.currentStep = null

        this.currentTrialNo = 0;
        this.currentTrial = null;

        this.nCorrect = 0
        this.nTotal = 0
        this.rts = [ ]

        this.element
            .addClass( "ss-go-task" )
            .load("resources/go-task.html", function() {

                var vis = { }

                vis.$bias     = self.element.find(".bias");
                vis.$cc       = self.element.find(".cc");
                vis.$feedback = self.element.find(".feedback");

                vis.$cc.colourChooser( { running: false } )

                self.steps = [

                    function() {
                        vis.$feedback.hide()
                        return { duration: self.options.iti }
                    },
                    function() {
                        vis.$bias.text(self.currentTrial.trialBias);
                        vis.$bias.show()
                        return { duration: self.options.bt }
                    },
                    function() {
                        vis.$bias.text('');
                        vis.$bias.hide();
                        return { duration: self.options.cti }
                    },
                    function() {
                        vis.$cc.show()
                        vis.$cc.colourChooser("option", "running", false);
                        vis.$cc.colourChooser("option", "cueVisible", true);
                        return { duration: self.options.ct }
                    },
                    function() {
                        vis.$cc.colourChooser("option", "cueVisible", false);
                        return { duration: self.options.cti }
                    },
                    function() {

                        var difficulty = self.options[self.currentTrial.difficulty]
                        if (difficulty)
                            self.currentTrial.proportion = difficulty;

                        var proportion = self.currentTrial.proportion;

                        if (self.currentTrial.target === "right")
                            proportion = 100 - proportion;

                        vis.$cc.colourChooser("option", "proportion", proportion)
                        vis.$cc.colourChooser("option", "target", self.currentTrial.target)
                        vis.$cc.colourChooser("option", "running", true)
                        vis.$cc.show()

                        if (self.currentTrial.trialType == "stop")
                            setTimeout(function() { vis.$cc.colourChooser("option", "borderVisible", true); }, self._getSSD())

                        self.currentTrial.response = "timeout"
                        self.currentTrial.rt = "Inf"

                        return { canRespond: true, duration: self.options.timeout }
                    },
                    function() {

                        vis.$cc.hide()
                        vis.$cc.colourChooser("option", "borderVisible", false);
                        vis.$cc.colourChooser("option", "running", false)
                        vis.$feedback.text(self._generateFeedback())
                        vis.$feedback.show()

                        return { duration: self.options.feedbackTime }
                    },
                    function() {

                        self.options.accuracy = parseInt(self.nCorrect * 100 / self.nTotal)

                        var sum = 0
                        for (var i = 0; i < self.rts.length; i++)
                            sum += self.rts[i]
                        self.options.meanRT = parseInt(sum / self.rts.length);

                        return { duration : 0 }
                    }
                ]

                self.vis = vis
                self._refresh()

            })
    },

    _getSSD : function() {
        return this.currentTrial.ssd
    },

    _generateFeedback : function() {

        this.nTotal++;

        if (this.currentTrial.response == "timeout") {
            return "too slow"
        }
        else if (this.currentTrial.response == this.currentTrial.target) {

            this.nCorrect++;
            this.rts.push(this.currentTrial.rt)
            return this.currentTrial.rt
        }
        else {
            return "incorrect"
        }
    },

    _update: function() {

        var self = this

        if (this.currentTrialNo < this.options.trialData.length) {

            if (this.step == 0)
                this.currentTrial = this.options.trialData[this.currentTrialNo]

            this.currentStep = this.steps[this.step]()
            this.timer = setTimeout(function() { self._update() }, this.currentStep.duration)
            this.startTime = new Date()
            this.step++

            if (this.step == this.steps.length) {
                this.step = 0;
                this.currentTrialNo++;

                console.log(this.currentTrial);
            }
        }
        else {

            this._trigger("completed")
        }
    },

    _keyPress: function(event, char) {

        if (this.currentStep != null && this.currentStep.canRespond) {
            if (char == this.options.leftKey) {
                this.currentTrial.rt = new Date() - this.startTime
                this.currentTrial.response = "left"
                clearTimeout(this.timer)
                this._update()
            }
            else if (char == this.options.rightKey) {
                this.currentTrial.rt = new Date() - this.startTime
                this.currentTrial.response = "right"
                clearTimeout(this.timer)
                this._update()
            }

        }

    },

    // called when created, and later when changing options
    _refresh: function() {
        if (this.options.trialNo < this.options.trialData.length)
            this._update()
    },

    // events bound via _bind are removed automatically
    // revert other modifications here
    destroy: function() {

        $.ss.task.prototype.destroy.call(this)

        this.element
            .removeClass( "ss-go-task" )
            .enableSelection()
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

        if (key == "trialNo") {

            this.step = 0

            if (value < this.options.trialData.length)
                this.currentTrial = this.options.trialData[value]
            else
                this._trigger("completed")
        }

        // in 1.9 would use _super
        $.Widget.prototype._setOption.call( this, key, value );
    }
});
