// ask for app requirement
// install the latest lib
// edit configuration files

var prompt = require('prompt');
var fs = require('fs');
var path = require('path');
var request = require('request');
var unzip = require('unzip');
var libxmljs = require("libxmljs");
var jf = require('jsonfile')
var util = require('util')
var clc = require('cli-color');
var dir = require('node-dir');
var _ = require('underscore');


exports.remove = function() {
    var settings = jf.readFileSync("pushbots.json");
    startBot(settings);
}

function startBot(settings) {
    var androidXml = fs.readFileSync('AndroidManifest.xml').toString();
    var packageName = getPackageName(androidXml);
    // downloading the latest lib
    console.log(clc.red('Removing Pushbots library ...'));
    RemoveLibrary(function() {
        //creating pushbots.xml
        removePushBotsXML(settings, function() {
            //modifying manifest
             editManifest(androidXml, packageName, settings, function() {
                console.log(clc.red("uninitalizing library .."));
                var activity = findActivity(androidXml);
                var MainActivity = deinitalizeLibrary(activity, packageName);
                //console.log(clc.green("success!"));
             })
        });
    })
}

function editManifest(androidXml, packageName, settings, cb) {
    androidXml = removeIntent(androidXml, packageName);
    //androidXml = addPermissions(androidXml, packageName);
    androidXml = removeReciever(androidXml, packageName);
    console.log("modifing manifest ...");
    fs.writeFileSync('AndroidManifest.xml', androidXml);
    cb();
}

function RemoveLibrary(cb) {
    var dirToRemove = path.join('.', 'libs');
    var pattern = /pushbots-lib-(.*).jar/
    dir.paths(dirToRemove, function(err, paths) {
        if (err) throw err;
        _.each(paths.files, function(file) {
            if (pattern.exec(file) && pattern.exec(file).length > 0) {
                fs.unlink(file, function(err) {
                    if (err) throw err;
                    console.log(clc.green('successfully deleted library'));
                });
            }

        });
    });
    cb();
}

function removePushBotsXML(result, cb) {
    var resFile = path.join('.', 'res', 'values', 'pushbots.xml');

    if (fs.existsSync(resFile)) {
        fs.unlink(resFile, function(err) {
            if (err) throw err;
            console.log(clc.green('successfully deleted pushbotsxml'));
        });
    }

    cb();
}

function getPackageName(xml) {
    var doc = libxmljs.parseXml(xml);
    return doc.root().attr('package').value();
}


function removeIntent(androidXml, packageName) {
    var intent = '<intent-filter>\n\
    <action android:name="' + packageName + '.MESSAGE" />\n\
    <category android:name="android.intent.category.DEFAULT" />\n\
</intent-filter>'
    return androidXml.replace(intent,"");
}

function addPermissions(androidXml, packageName) {
    var permssion = '\n\
    <!-- GCM connects to Google Services. -->\n\
    <uses-permission android:name="android.permission.INTERNET" />\n\
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>\n\
    <!-- GCM requires a Google account. -->\n\
    <uses-permission android:name="android.permission.GET_ACCOUNTS" />\n\
    <uses-permission android:name="android.permission.WAKE_LOCK" />\n\
    <permission android:name="' + packageName + '.permission.C2D_MESSAGE" android:protectionLevel="signature" />\n\
    <uses-permission android:name="' + packageName + '.permission.C2D_MESSAGE" />\n\
    <!-- This app has permission to register and receive dataf message. -->\n\
    <uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />\n\
</manifest>';

    return androidXml.replace('</manifest>', permssion);
}

function removeReciever(androidXml, packageName) {
    var receiver = '\n\
        <receiver\n\
            android:name="com.pushbots.google.gcm.GCMBroadcastReceiver"\n\
        android:permission="com.google.android.c2dm.permission.SEND" >\n\
            <intent-filter>\n\
                <!-- Receives the actual messages. -->\n\
                <action android:name="com.google.android.c2dm.intent.RECEIVE" />\n\
                <!-- Receives the registration id. -->\n\
                <action android:name="com.google.android.c2dm.intent.REGISTRATION" />\n\
                <category android:name="' + packageName + '" />\n\
            </intent-filter>\n\
        </receiver>\n\
        <receiver android:name="com.pushbots.push.DefaultPushHandler" />\n\
        <service android:name="com.pushbots.push.GCMIntentService" />\n\
';
    return androidXml.replace(receiver, '');

}

function findActivity(androidXml) {
    var doc = libxmljs.parseXml(androidXml.split("android:").join(""));
    var activities = doc.find('/manifest/application/activity');

    // console.log('activities = ', activities);
    for (var i = activities.length - 1; i >= 0; i--) {
        var activity = activities[i];
        // console.log(activity.toString());
        var intent = activity.find('intent-filter/action[@name="android.intent.action.MAIN"]');
        // console.log('intents = ', intent);
        if (intent && intent.length > 0) {
            return activity.attr('name').value();
        }

    }
}

function deinitalizeLibrary(activityName, packageName) {
    var activityFolder = packageName.split('.').join(path.sep);
    var filename = activityName.split('.').join(path.sep);

    var Filepath = path.join("src", activityFolder, filename + ".java");
    var readMainActivity = fs.readFileSync(Filepath).toString();

    var pbinit = "Pushbots.sharedInstance().init(this);"
    var pbimport= "import com.pushbots.push.Pushbots;";

    resContent = readMainActivity.replace(pbinit, '');
    resContent = resContent.replace(pbimport, '');

    fs.writeFileSync(Filepath, resContent);


}