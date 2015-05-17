/* remove commander component
 * To use add require('../cmds/remove.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';
var prompt = require('prompt');
var fs = require('fs');
var eclipse = require('./android/eclipse-remove');
var as = require('./android/as-remove');
var phonegap = require('./android/phonegap-remove');
var figlet = require('figlet');
var jf = require('jsonfile')
var util = require('util')
var clc = require('cli-color');
var exec = require('child_process').exec;

module.exports = function(program) {

    program
        .command('remove')
        .version('0.0.0')
        .description('removes pushbots from your project')
        .action(function( /* Args here */ ) {
            try {
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
                        //console.log("detected pushbots JSON File");
                        var settings = jf.readFileSync("pushbots.json");
                        //console.log(settings);
                        if (fs.existsSync("./build.gradle")) {
                            // Do something
                            console.log(clc.green("Android Studio Project detected"))
                            as.remove();
                        } else if (fs.existsSync("./AndroidManifest.xml")) {
                            console.log(clc.green("Eclipse Project detected"))
                            eclipse.remove();
                        } else if (fs.existsSync("config.xml") && fs.existsSync("www")) {
                            console.log(clc.green("Phonegap project detected"));
                            phonegap.remove();
                        }else{
                        console.log(clc.red("couldn't detect type of this project. Make sure you are in the root folder of your Android/Cordova project"));

                    }

                    } else {
                        console.log(clc.red('run pushbots config first.'));
                    }  
                });
            } catch (e) {
                console.log(clc.red("\n operation canceled"));
                console.log(e);
            }


        })

}