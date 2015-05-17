/* test commander component
 * To use add require('../cmds/test.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';
var pushbots = require('pushbots-api');
var fs = require('fs');
var jf = require('jsonfile')
var figlet = require('figlet');
var _ = require('underscore');
var clc = require('cli-color');

module.exports = function(program) {

    program
        .command('test')
        .version('0.0.0')
        .description('test push notifications ')
        .action(function( msg ) {
        	//console.log(msg);
            // Your code goes here

            figlet('Pushbots', function(err, data) {
                if (err) {
                    console.log('Something went wrong...');
                    console.dir(err);
                    return;
                }
                console.log(data);
                console.log(clc.red('Sending a test push notification using PushBots API and the pushbots.json file generated through pushbots config command.'));
                if (fs.existsSync("pushbots.json")) {
                    var settings = jf.readFileSync("pushbots.json");
                    //console.log(settings);
                    var settings = jf.readFileSync("pushbots.json");
                    var Pushbots = new pushbots.api({
                        id: settings.App_ID,
                        secret: settings.App_Secret
                    });
        			var m = _.isObject(msg)?'hi there':msg;
                    Pushbots.setMessage(m, [0, 1]);
                    Pushbots.push(function(response) {

                    });
                } else {
                    console.log('no settings file');

                }
            });


        });

};