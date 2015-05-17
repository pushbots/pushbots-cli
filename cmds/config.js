/* config commander component
 * To use add require('../cmds/config.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';
var prompt = require('prompt');
var jf = require('jsonfile')
var figlet = require('figlet');
var clc = require('cli-color');

function saveJsonFile(result, cb) {
    try {
        var file = 'pushbots.json'
        var obj = {
            App_ID: result['App Id:'],
            App_Secret: result['App Secret:'],
            GCM_Sender_ID: result['GCM Sender Id:']
        }
        jf.writeFile(file, obj, function(err) {
            if (err)
                console.log(err)
        })
        cb();
    } catch (e) {
          console.log(clc.red("\n operation canceled"));
    }

}


module.exports = function(program) {

    program
        .command('config')
        .version('0.0.0')
        .description('configure your pushbots application settings')
        .action(function( /* Args here */ ) {
            // Your code goes here
            figlet('Pushbots', function(err, data) {
                if (err) {
                    console.log('Something went wrong...');
                    console.dir(err);
                    return;
                }
                console.log(data);
                console.log(clc.red('Please, enter the following credentials:'));

                try {
                    prompt.message = "";
                    prompt.delimiter = "";
                    prompt.start();
                    prompt.get([{
                        name: 'App Id:',
                        required: true,
                        pattern: /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i,
                        message: 'This is not a valid PushBots AppID.',
                        description: 'Enter Your App ID',
                        default: ''
                    }, {
                        name: 'App Secret:',
                        required: true,
                        pattern: /^[a-f0-9]{32}$/i,
                        description: 'Enter Your App Secret',
                    }, {
                        name: 'GCM Sender Id:',
                        required: true
                    }], function(err, result) {
                        saveJsonFile(result, function() {
                            console.log(clc.green('Saved succesfully! now run pushbots install'))
                        });
                    });
                } catch (e) {
                    console.log("\n operation canceled");
                }



            });



        });

};