
$.widget( "ss.stopTask", $.ss.goTask, {

    options: {
        ssd: 50
    },

    _create: function() {

        $.ss.goTask.prototype._create.call(this)
    },

    _generateFeedback : function() {

        if (this.currentTrial.trialType == "stop") {

            if (this.currentTrial.response == "timeout")
                this.options.ssd = Math.min(this.options.ssd + 50, 2000)
            else
                this.options.ssd = Math.max(this.options.ssd - 50, 50)

            return ""
        }
        else if (this.currentTrial.response == "timeout") {
            this.nTotal++;
            return "too slow"
        }
        else if (this.currentTrial.response != this.currentTrial.target) {
            this.nTotal++;
            return "incorrect"
        }
        else
        {
            this.nCorrect++;
            this.nTotal++;
            this.rts.push(this.currentTrial.rt)
            return this.currentTrial.rt
        }
    },

    _keyPress: function(event, char) {

        if (this.currentStep != null && this.currentStep.canRespond) {
            if (char == this.options.leftKey) {
                this.currentTrial.rt = new Date() - this.startTime
                this.currentTrial.response = "left"

                if (this.currentTrial.trialType != "stop") {

                    clearTimeout(this.timer)
                    this._update()
                }
                else {
                    this.currentStep.canRespond = false
                }
            }
            else if (char == this.options.rightKey) {
                this.currentTrial.rt = new Date() - this.startTime
                this.currentTrial.response = "right"

                if (this.currentTrial.trialType != "stop") {

                    clearTimeout(this.timer)
                    this._update()
                }
                else {
                    this.currentStep.canRespond = false
                }
            }

        }

    },

    _getSSD : function() {

        var ssd = this.currentTrial.ssd

        if (ssd == "auto")
            ssd = Math.round(this.options.ssd)
        else
            ssd = parseInt(ssd)

        this.currentTrial.ssd = ssd

        console.log(ssd)

        return ssd
    }

});
