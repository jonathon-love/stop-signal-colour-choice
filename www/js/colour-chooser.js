
'use strict';

$.widget( "ss.colourChooser", {

    options: {
        running: true,
        fps: 20,
        nCellsX: 32,
        nCellsY: 32,
        dCellsX: 20,
        dCellsY: 20,
        proportion: 40,
        colour1: [0., 1., 0.],
        colour2: [0., 0., 1.],
        borderWidth: 2,
        borderVisible: false,
        cueVisible: true,
        borderColour: [1, 0, 0],
        accuracy: null,
        meanRT: null
    },

    // the constructor
    _create: function() {

        var self = this
        self.element.addClass("rc-rdk")
        self.element.append('<canvas class="rc-rdk-canvas"></canvas>')

        var $canvas = self.element.find(".rc-rdk-canvas")
        var canvas = $canvas[0]
        var gl = canvas.getContext("experimental-webgl")

        self.canvas = canvas
        self.gl = gl

        var dpr = window.devicePixelRatio || 1;

        canvas.width = dpr * $canvas.width();
        canvas.height = dpr * $canvas.height();

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.enable(gl.BLEND);

        var vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, self._getVertexShaderSource());
        gl.compileShader(vs);

        var fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, self._getFragmentShaderSource());
        gl.compileShader(fs);

        var program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if ( ! gl.getShaderParameter(vs, gl.COMPILE_STATUS))
            console.log(gl.getShaderInfoLog(vs));

        if ( ! gl.getShaderParameter(fs, gl.COMPILE_STATUS))
            console.log(gl.getShaderInfoLog(fs));

        if ( ! gl.getProgramParameter(program, gl.LINK_STATUS))
            console.log(gl.getProgramInfoLog(program));

        var cellWidth = 2 / this.options.nCellsX;
        var cellHeight = 2 / this.options.nCellsY;

        this.nCells = this.options.nCellsX * this.options.nCellsY
        this.dCells = this.options.dCellsX * this.options.dCellsY

        self.vertices = new Float32Array(this.nCells * 12);

        var originX = -1;
        var originY = 1;

        for (var i = 0; i < this.options.nCellsX; i++) {

            var y = originY - (i * cellHeight);

            for (var j = 0; j < this.options.nCellsY; j++) {

                var x = originX + (j * cellWidth);
                var k = 12 * (i * this.options.nCellsY + j);

                self.vertices[k++] = x
                self.vertices[k++] = y
                self.vertices[k++] = x + cellWidth
                self.vertices[k++] = y - cellHeight
                self.vertices[k++] = x + cellWidth
                self.vertices[k++] = y
                self.vertices[k++] = x
                self.vertices[k++] = y - cellHeight
                self.vertices[k++] = x + cellWidth
                self.vertices[k++] = y - cellHeight
                self.vertices[k++] = x
                self.vertices[k++] = y
            }
        }

        var vbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, self.vertices, gl.STATIC_DRAW);

        var itemSize = 2;
        var numItems = self.vertices.length / itemSize;


        gl.useProgram(program);

        program.verts = gl.getAttribLocation(program, "verts");
        gl.enableVertexAttribArray(program.verts);
        gl.vertexAttribPointer(program.verts, itemSize, gl.FLOAT, false, 0, 0);


        self.colours = new Float32Array(18 * this.nCells);
        self.colourBuffer = gl.createBuffer();


        // Create colour region

        self.colourRegion = new Array(this.options.dCellsY);
        for (var i = 0; i < this.options.dCellsY; i++) {

            var displayOffset = this.options.nCellsX * (this.options.nCellsY - this.options.dCellsY) / 2;
            var rowOffset = (i * this.options.nCellsX);
            var columnOffset = (this.options.nCellsX - this.options.dCellsX) / 2;
            var size = this.options.dCellsX;
            var offset = displayOffset + rowOffset + columnOffset;
            self.colourRegion[i] = new Float32Array(self.colours.buffer, 4 * 18 * offset, 18 * size);
        }

        // Create border region

        self.borderRegion = [ ];

        // add top rows
        self.borderRegion.push(new Float32Array(self.colours.buffer, 0, 18 * this.options.nCellsX * this.options.borderWidth));
        // add bottom rows
        self.borderRegion.push(new Float32Array(self.colours.buffer, self.colours.byteLength - 4 * 18 * this.options.nCellsX * this.options.borderWidth));

        for (var i = 0; i < this.options.nCellsY - (2 * this.options.borderWidth); i++) {
            var offset = (this.options.borderWidth + i) * this.options.nCellsX;
            self.borderRegion.push(new Float32Array(self.colours.buffer, 4 * 18 * offset, 18 * this.options.borderWidth));
            offset += this.options.nCellsX - this.options.borderWidth;
            self.borderRegion.push(new Float32Array(self.colours.buffer, 4 * 18 * offset, 18 * this.options.borderWidth));
        }

        // Create cue region

        self.cueRegion = [ ];
        self.cueRegion.push(new Float32Array(self.colours.buffer, 4 * 18 * (this.options.nCellsY * this.options.nCellsX / 2 - this.options.nCellsX/2 - 1), 18 * 2))
        self.cueRegion.push(new Float32Array(self.colours.buffer, 4 * 18 * (this.options.nCellsY * this.options.nCellsX / 2 + this.options.nCellsX/2 - 1), 18 * 2))

        self._animate();

        program.colours = gl.getAttribLocation(program, "colours");
        gl.enableVertexAttribArray(program.colours);
        gl.vertexAttribPointer(program.colours, 3, gl.FLOAT, false, 0, 0);

        this._drawScene();
        this._tick();
    },

    // called when created, and later when changing options
    _refresh: function() {

    },

    // events bound via _bind are removed automatically
    // revert other modifications here
    destroy: function() {

        this.element
            .removeClass( "rc-rdk" )
            .empty()
    },

    // _setOptions is called with a hash of all options that are changing
    // always refresh when changing options
    _setOptions: function() {
        // in 1.9 would use _superApply
        $.Widget.prototype._setOptions.apply( this, arguments );
    },

    // _setOption is called for each individual option that is changing
    _setOption: function( key, value ) {

        var wasRunning = this.options.running

        // in 1.9 would use _super
        $.Widget.prototype._setOption.call( this, key, value );

        if (this.options.running && !wasRunning) {
            this._tick()
        }

        this._animate();
        this._drawScene();
    },

    _tick : function() {
        var self = this
        if (this.options.running) {

            //var timeNow = new Date().getTime();
            var period = 1000/this.options.fps;
            window.setTimeout(function() { self._tick() }, period)
            //window.requestAnimationFrame(function() { self._tick() } );

            /*if (_.isUndefined(this.es))
                this.es = [ ];

            var elapsed = timeNow - this.lastTime;
            this.lastTime = timeNow;

            this.es.push(elapsed)
            if (this.es.length > 20) {
                console.log(this.es)
                this.es = [ ]
            }*/
        }
        this._animate();
        this._drawScene();

    },

    _drawScene : function() {

        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length / 2);

    },

    _animate : function() {

        var colourA;
        var colourB;
        var proportion;

        if (this.options.running == false) {
            proportion = 0;
            colourA = [0., 0., 0.];
            colourB = [0., 0., 0.];
        }
        else if (this.options.proportion < 50) {
            proportion = this.options.proportion;
            colourA = this.options.colour1;
            colourB = this.options.colour2;
        } else {
            proportion = 100 - this.options.proportion;
            colourA = this.options.colour2;
            colourB = this.options.colour1;
        }

        var left = _.range(this.dCells)
        var selected = [ ];

        var n = this.dCells * proportion / 100;
        for (var i = 0; i < n; i++) {
            index = parseInt(left.length * Math.random());
            if (index == left.length)
                index = left.length - 1;
            var cellIndex = left[index];
            selected.push(cellIndex);
            left = _.without(left, cellIndex);
        }

        for (var i = 0; i < this.options.dCellsY; i++) {
            var row = this.colourRegion[i]
            for (var j = 0; j < row.length; j+=3) {
                row[j+0] = colourA[0];
                row[j+1] = colourA[1];
                row[j+2] = colourA[2];
            }

        }

        for (var i = 0; i < selected.length; i++) {
            var index = selected[i]
            var rowNo = parseInt(index / this.options.dCellsX);
            var colNo = parseInt(index % this.options.dCellsX);
            var row = this.colourRegion[rowNo];

            for (var j = 0; j < 18; j += 3) {

                row[colNo * 18 + j + 0] = colourB[0];
                row[colNo * 18 + j + 1] = colourB[1];
                row[colNo * 18 + j + 2] = colourB[2];
            }
        }

        var borderColour = this.options.borderColour;
        if ( ! this.options.borderVisible)
            borderColour = [0., 0., 0.];

        for (var i = 0; i < this.borderRegion.length; i++) {
            var row = this.borderRegion[i];
            for (var j = 0; j < row.length; j+=3) {
                row[j + 0] = borderColour[0];
                row[j + 1] = borderColour[1];
                row[j + 2] = borderColour[2];
            }
        }

        if ( ! this.options.running) {
            var cueColour = [1., 1., 1.];
            if ( ! this.options.cueVisible)
                cueColour = [0., 0., 0.];

            for (var i = 0; i < this.cueRegion.length; i++) {
                var row = this.cueRegion[i];
                for (var j = 0; j < row.length; j+=3) {
                    row[j + 0] = cueColour[0];
                    row[j + 1] = cueColour[1];
                    row[j + 2] = cueColour[2];
                }
            }
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.colours, this.gl.STATIC_DRAW);
    },

    _getVertexShaderSource : function() {

        return "\
        attribute vec2 verts;        \
                                    \
        attribute vec3 colours; \
        varying vec3 vcolours; \
                                    \
        void main() {                \
            gl_Position = vec4(verts.x, verts.y, 0.0, 1.0);        \
            vcolours = colours; \
        }"
    },

    _getFragmentShaderSource : function() {
        return "\
        #ifdef GL_ES \n \
                precision highp float;        \n    \
        #endif \n \
                                                \
        varying vec3 vcolours; \
                                                \
        void main() {                            \
            gl_FragColor = vec4(vcolours, 1.);\
           }"
    }
});
