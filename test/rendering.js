var path = require('path'),
    sys = require('sys'),
    assert = require('assert'),
    fs = require('fs'),
    xml2js = require('xml2js');

var mess = require('mess');
var tree = require('mess/tree');
var helper = require('./support/helper');

helper.files('rendering', 'mml', function(file) {
    exports['test rendering ' + file] = function(beforeExit) {
        var completed = false;

        helper.file(file, function(mml) {
            new mess.Renderer({
                paths: [ path.dirname(file) ],
                data_dir: path.join(__dirname, '../data'),
                local_data_dir: path.join(__dirname, 'rendering'),
                filename: file
            }).render(mml, function (err, output) {
                if (err) {
                    throw err;
                } else {
                    var result = helper.resultFile(file);
                    helper.file(result, function(result) {
                        // Parse the XML file.
                        var resultParser = new xml2js.Parser();
                        resultParser.addListener('end', function(resultXML) {
                            var messParser = new xml2js.Parser();
                            messParser.addListener('end', function(messXML) {
                                completed = true;
                                try {
                                    assert.deepEqual(messXML, resultXML);
                                } catch (e) {
                                    console.log(helper.stylize("Failure", 'red') + ': ' + helper.stylize(file, 'underline') + ' differs from expected result.');
                                    helper.showDifferences(e);
                                    throw '';
                                }
                                
                            });
                            messParser.parseString(output);
                        });
                        resultParser.parseString(result);
                    });
                }
            });
        });

        beforeExit(function() {
            assert.ok(completed, 'Rendering finished.');
        });
    }
});
