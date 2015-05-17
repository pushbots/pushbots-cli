var prompt = require('prompt');
var fs = require('fs');
var path = require('path');
var request = require('request');
var unzip = require('unzip');
var libxmljs = require("libxmljs");
var sys = require('sys')
var exec = require('child_process').exec;
var jf = require('jsonfile')
var util = require('util')
var Spinner = require('cli-spinner').Spinner;
var spinner = new Spinner('processing.. %s');
var clc = require('cli-color');


exports.install = function() {
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    var settings = jf.readFileSync("pushbots.json");
    startBot(settings);
}

function startBot(result) {
    console.log(clc.yellow("Installing android platform and PushBots plugin"));
    exec("cordova platform remove android ", function() {
        setTimeout(function() {
            console.log(clc.cyan("cleaning.."));
            exec("cordova plugin remove com.pushbots.push", function() {
            console.log(clc.cyan("adding android platform.."));
                setTimeout(function() {
                    exec('cordova platform add android', function() {
                       console.log(clc.cyan("Fetching PushBots plugin..."));
                        exec('cordova plugin add http://github.com/pushbots/phonegap && cordova prepare android', function(err, out, code) {
                            createXMLandInitalize(result);
                        });
                    })
                }, 5000);
            })
        }, 4000)
    });

}


function createXMLandInitalize(result) {
    //initalize library
    initalizeLibrary(result);
    console.log(clc.cyan("initalizing library ... "));
    insertPushBotsXML(result);
}

function insertPushBotsXML(result) {

        var resFile = path.join('platforms', 'android', 'res', 'values', 'pushbots.xml');
        var resContent = '<?xml version="1.0" encoding="utf-8"?>\n\
<resources>\n\
    <!-- Pushbots Application ID  -->\n\
    <string name="pb_appid">' + result.App_ID + '</string>\n\
    <!-- GCM Sender ID -->\n\
    <string name="pb_senderid">' + result.GCM_Sender_ID + '</string>\n\
    <!-- Pushbots Log Level  log Tag "PB2" -->\n\
    <string name="pb_logLevel">DEBUG</string>\n\
</resources>';
        fs.writeFile(resFile, resContent, function() {
            console.log(clc.green("success!! now type cordova run android"));
            process.exit();
            //cb();
        });


}

function initalizeLibrary(result) {


    var readJsFile = fs.readFileSync(path.join('.', 'www', 'js', 'index.js')).toString();
    var pattern = /onDeviceReady:([\s\S]*)function\(\)(.*){/.exec(readJsFile);
    if (pattern.length > 0)
        pattern = pattern[0];
    var addBefore = readJsFile.indexOf('PushbotsPlugin.initialize');
    var importSyntax = 'if(PushbotsPlugin.isAndroid()){\n\
        PushbotsPlugin.initialize();\n\
        PushbotsPlugin.onNotificationClick(myMsgClickHandler);\n\
\n} if(PushbotsPlugin.isiOS()){\n\
    PushbotsPlugin.initializeiOS("' + result.App_ID + '");\n\
\n}';
    var findAppInitalize = 'app.initialize();';
    var replaceAppInitalize = 'app.initialize();\n\
    function myMsgClickHandler(msg){\n\
    console.log("Clicked: " + JSON.stringify(msg));\n\
    alert(msg.message);\n\
}';
    if (addBefore < 0) {
        var resContent = readJsFile.replace(pattern, pattern + '\n' + importSyntax);
        var resContent = resContent.replace(findAppInitalize, replaceAppInitalize);
        fs.writeFileSync(path.join('.', 'www', 'js', 'index.js'), resContent);
        return true;
    }
}

function puts(error, stdout, stderr) {
    sys.puts(stdout)
}