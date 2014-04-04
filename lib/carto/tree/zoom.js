var tree = require('../tree');

// Storage for zoom ranges. Only supports continuous ranges,
// and stores them as bit-sequences so that they can be combined,
// inverted, and compared quickly.
tree.Zoom = function(op, value, index) {
    this.op = op;
    this.value = value;
    this.index = index;
};

tree.Zoom.prototype.setZoom = function(zoom) {
    this.zoom = zoom;
    return this;
};

tree.Zoom.prototype.ev = function(env) {
    var start = 0,
        end = Infinity,
        value = parseInt(this.value.ev(env).toString(), 10),
        zoom = 0;

    if (value > tree.Zoom.maxZoom || value < 0) {
        env.error({
            message: 'Only zoom levels between 0 and ' +
                tree.Zoom.maxZoom + ' supported.',
            index: this.index
        });
    }

    switch (this.op) {
        case '=':
            this.zoom = 1 << value;
            return this;
        case '>':
            start = value + 1;
            break;
        case '>=':
            start = value;
            break;
        case '<':
            end = value - 1;
            break;
        case '<=':
            end = value;
            break;
    }
    for (var i = 0; i <= tree.Zoom.maxZoom; i++) {
        if (i >= start && i <= end) {
            zoom |= (1 << i);
        }
    }
    this.zoom = zoom;
    return this;
};

tree.Zoom.prototype.toString = function() {
    return this.zoom;
};

// Covers all zoomlevels from 0 to 12
tree.Zoom.all = 0x7FFFFF;

tree.Zoom.maxZoom = 12;

tree.Zoom.ranges = {
    0: 14285715,
    1: 7142858,
    2: 3571429,
    3: 1785715,
    4: 892858,
    5: 446429,
    6: 223215,
    7: 111608,
    8: 55804,
    9: 27902,
    10: 13951,
    11: 6976,
    12: 3488,
    13: 1744

};

// Only works for single range zooms. `[XXX....XXXXX.........]` is invalid.
tree.Zoom.prototype.toXML = function() {
    var conditions = [];
    if (this.zoom != tree.Zoom.all) {
        var start = null, end = null;
        for (var i = 0; i <= tree.Zoom.maxZoom; i++) {
            if (this.zoom & (1 << i)) {
                if (start === null) start = i;
                end = i;
            }
        }
        if (start > 0) conditions.push('    <MaxScaleDenominator>' +
            tree.Zoom.ranges[start] + '</MaxScaleDenominator>\n');
        if (end < 12) conditions.push('    <MinScaleDenominator>' +
            tree.Zoom.ranges[end + 1] + '</MinScaleDenominator>\n');
    }
    return conditions;
};

tree.Zoom.prototype.toString = function() {
    var str = '';
    for (var i = 0; i <= tree.Zoom.maxZoom; i++) {
        str += (this.zoom & (1 << i)) ? 'X' : '.';
    }
    return str;
};
