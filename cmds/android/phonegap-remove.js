// ask for app requirement
// install the latest lib
// edit configuration files

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


exports.remove = function() {
    var settings = jf.readFileSync("pushbots.json");
    startBot(settings);
}

function startBot(result) {
   removePlugin(result);
}

function removePlugin(result) {
    exec("cordova plugin remove com.pushbots.push", function() {

        setTimeout(function() {
            //downloading the plugin
            console.log("Removing plugin.");
            createXMLandInitalize(result);

        }, 3000)



    });



}

function createXMLandInitalize(result) {
    //edit XML

    //initalize library
    if (uninitalizeLibrary(result)) {
        console.log("uninitalized library ... ")
    } else {
        console.log("unIntailizing Library ... ");
    }
    removePushBotsXML(result);

}

function removePushBotsXML(result) {
    var resFile = path.join('platforms', 'android', 'res', 'values', 'pushbots.xml');
    setTimeout(function() {
        if (fs.existsSync(resFile)) {
            fs.unlink(resFile, function(err) {
                if (err) throw err;
                console.log(clc.green('successfully deleted pushbotsxml'));
            });
        }
    }, 3000);

}

function uninitalizeLibrary(result) {
    var readJsFile = fs.readFileSync(path.join('.', 'www', 'js', 'index.js')).toString();
    var importSyntax = 'if(PushbotsPlugin.isAndroid()){\n\
        PushbotsPlugin.initialize();\n\
        PushbotsPlugin.onNotificationClick(myMsgClickHandler);\n\
\n} if(PushbotsPlugin.isiOS()){\n\
    PushbotsPlugin.initializeiOS("'+ result.App_ID +'");\n\
\n}';
    var replaceAppInitalize = 'function myMsgClickHandler(msg){\n\
    console.log("Clicked: " + JSON.stringify(msg));\n\
    alert(msg.message);\n\
}';
 var resContent = readJsFile.replace(importSyntax, '');
var resContent = resContent.replace(replaceAppInitalize, '');
fs.writeFileSync(path.join('.', 'www', 'js', 'index.js'), resContent);

   
}

function puts(error, stdout, stderr) {
    sys.puts(stdout)
}