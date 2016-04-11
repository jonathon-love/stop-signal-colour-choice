
function DataSync(url, participant, session, gist) {

    this.url = url
    this.participant = participant
    this.session = session
    this.gist = gist
    this.data = null

    var self = this
}

DataSync.prototype.load = function(callback) {

    if (this.data != null) {
        if (callback)
            callback()
        var obj = { }
        obj.success = function(callback) { callback(); return obj }
        obj.error = function() { return obj }
        return obj
    }

    var self = this

    return $.getJSON(this.url + "?p=" + this.participant + "&s=" + this.session + "&g=" + this.gist, function(data) {
        self.data = data
        callback(data)
    })

}

DataSync.prototype.getData = function() {

    return this.data
}

DataSync.prototype.setData = function(data, callback) {

    this.data = data
}

DataSync.prototype.flush = function(callback) {

    var flattened = JSON.stringify(this.data, null, 4)

    var params = {
        p : this.participant,
        s : this.session,
        d : flattened
    }

    var self = this

    return $.post(this.url, params)
}
