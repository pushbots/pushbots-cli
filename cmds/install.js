/* install commander component
 * To use add require('../cmds/install.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var prompt = require('prompt');
var fs = require('fs');
var eclipse = require('./android/eclipse');
var as = require('./android/as');
var phonegap = require('./android/phonegap');
var figlet = require('figlet');
var jf = require('jsonfile')
var util = require('util')
var clc = require('cli-color');
var exec = require('child_process').exec;

function saveJsonFile(result, cb) {
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
    setTimeout(function() {
        cb();
    }, 1000);


}

function thePrompt(cb) {
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
            console.log(clc.green('Saved succesfully!'));
            cb();
        });
    });

}

function startB() {
    //console.log("detected pushbots JSON File");
    try {
        var settings = jf.readFileSync("pushbots.json");
        //console.log(settings);
        if (fs.existsSync("./build.gradle")) {
            // Do something
            console.log(clc.green("Android Studio Project detected"))
            as.install();
        } else if (fs.existsSync("./AndroidManifest.xml")) {
            console.log(clc.green("Eclipse Project detected"))
            eclipse.install();
        } else if (fs.existsSync("config.xml") && fs.existsSync("www")) {
            console.log(clc.green("Phonegap project detected"));
            phonegap.install();
        } else {
            console.log(clc.red("couldn't detect type of this project. Make sure you are in the root folder of your Android/Cordova project"));

        }
    } catch (e) {
        console.log(clc.red("corrupt pushbots.json file"));
    }

}
module.exports = function(program) {

    program
        .command('install')
        .version('0.0.1')
        .description('Install pushbots')
        .action(function() {
            figlet('pushbots', function(err, data) {
                if (err) {
                    console.log('Something went wrong...');
                    console.dir(err);
                    return;
                }
                console.log(data)
                // check project type
                // call specific platform install
                if (fs.existsSync("pushbots.json")) {
                    startB();
                } else {
                    //console.log(clc.red('run pushbots config first.'));
                    console.log(clc.red('Please, enter the following credentials:'));
                    thePrompt(function() {
                        startB();
                    });
                }  


            });


        });

};