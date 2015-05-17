// ask for app requirement
// install the latest lib
// edit configuration files
var path = require('path');
var prompt = require('prompt');
var fs = require('fs');
var request = require('request');
var unzip = require('unzip');
var libxmljs = require("libxmljs");
var jf = require('jsonfile')
var util = require('util')
var clc = require('cli-color');
var _ = require('underscore');


exports.remove = function() {
    var settings = jf.readFileSync("pushbots.json");
    startBot(settings);
}

function getCorrectPath() {
    if (fs.existsSync(path.join('.', 'Application', 'src'))) {
        return "Application"
    } else {
        return "app";
    }
}


function startBot(settings) {
    //setting the path
    var xmlPath = path.join('.', getCorrectPath(), 'src', 'main', 'AndroidManifest.xml');
    //reading manifestFile
    var androidXml = fs.readFileSync(xmlPath).toString();
    //getting Package name
    var packageName = getPackageName(androidXml);
    //creating pushbots.xml
    removePushBotsXML(settings, function() {
        console.log(clc.cyan('Removing Pushbots.xml..'));
        //editing the manifest 
        editManifest(xmlPath, androidXml, packageName, settings, function() {
            console.log(clc.cyan('Editing Android Manifest..'));
            //adding gradle dependencies
            removeGradleDependency(function() {
                console.log(clc.yellow('Removing gradle dependency..'));
                var activity = findActivity(androidXml);
                console.log(clc.red("Uninitalizing library .."));
                //initalizing the library
                uninitalizeLibrary(activity, packageName, function() {
                    console.log(clc.green("Success!"));
                });
            })
        })
    });
}

function editManifest(xmlPath, androidXml, packageName, settings, cb) {
    //edit Manifest file


    //androidXml = clearPermissions(androidXml, packageName);
    androidXml = clearIntentAndReciever(androidXml, packageName);

    //androidXml = addIntent(androidXml, packageName);
    //androidXml = addPermissions(androidXml, packageName);
    //androidXml = addReciever(androidXml, packageName);
    //cleaning comments
    androidXml = androidXml.replace(/<!--[\s\S]*?-->/gm, '');
    //clean xml file from empty lines
    androidXml = androidXml.replace(/^\s*[\r\n]/gm, '');
    fs.writeFileSync(xmlPath, androidXml);
    cb();
}

function removePushBotsXML(result, cb) {

    var resFile = path.join('.', getCorrectPath(), 'src', 'main', 'res', 'values', 'pushbots.xml');
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

function clearPermissions(androidXml, packageName) {
    var permission_1 = /<uses-permission(.*)android:name="android.permission.INTERNET"(.*)\/>/
    var permission_2 = /<uses-permission(.*)android:name="android.permission.ACCESS_NETWORK_STATE"(.*)\/>/
    var permission_3 = /<uses-permission(.*)android:name="android.permission.GET_ACCOUNTS"(.*)\/>/
    var permission_4 = /<uses-permission(.*)android:name="android.permission.WAKE_LOCK"(.*)\/>/
    var permission_5 = new RegExp('<permission(.*)android:name="' + packageName + '.permission.C2D_MESSAGE"(.*)android:protectionLevel="signature"(.*)\/>', "");
    var permission_6 = new RegExp('<uses-permission(.*)android:name="' + packageName + '.permission.C2D_MESSAGE"(.*)\/>', "");
    var permission_7 = /<uses-permission(.*)android:name="com.google.android.c2dm.permission.RECEIVE"(.*)\/>/;
    var result = androidXml.replace(permission_1, '');
    result = result.replace(permission_2, '');
    result = result.replace(permission_3, '')
    result = result.replace(permission_4, '')
    result = result.replace(permission_5, '')
    result = result.replace(permission_6, '')
    result = result.replace(permission_7, '')
    return result;
}

function clearIntentAndReciever(androidXml, packageName) {
    var reciever1 = /<receiver(.*)android:name="com.pushbots.push.DefaultPushHandler" \/>/gi
    var reciever2 = /<service(.*)android:name="com.pushbots.push.GCMIntentService" \/>/gi
    var koko = androidXml.replace(reciever1, '');
    koko = koko.replace(reciever2, '');

    var rePattern = new RegExp(/<intent-filter>([\s\S]*?)<\/intent-filter>/gm);
    var arrMatches = androidXml.match(rePattern);
    var recieverPattern = new RegExp(/<intent-filter>([\s\S]*?)<\/intent-filter>/gm);
    _.each(arrMatches, function(v) {
        if (v.indexOf(packageName+".MESSAGE") > 0) {
            koko = koko.replace(v, "")
        }
    });

    return koko;



}


function addIntent(androidXml, packageName) {
    var repalced = /<intent-filter>([\s\S]*)android.intent.action.MAIN([\s\S]*)<\/intent-filter>/.exec(androidXml);
    if (repalced.length > 0)
        repalced = repalced[0];

    var intent = '<intent-filter>\n\
    <action android:name="' + packageName + '.MESSAGE" />\n\
    <category android:name="android.intent.category.DEFAULT" />\n\
</intent-filter>'

    return androidXml.replace(repalced, repalced + '\n' + intent);
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

function addReciever(androidXml, packageName) {
    if (androidXml.indexOf("com.pushbots.google.gcm.GCMBroadcastReceiver") < 0) {
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
</application>';
        return androidXml.replace('</application>', receiver);
    } else {
        return androidXml;
    }


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

function removeGradleDependency(cb) {

    var gradlePath = path.join('.', getCorrectPath(), 'build.gradle');
    var androidXml = fs.readFileSync(gradlePath).toString();
    var finalFileContent;
    var dep = /compile(.*)'com.pushbots:pushbots-lib:(.*)/;
    var resContent = androidXml.replace(dep, '');
    fs.writeFileSync(gradlePath, resContent);
    cb();

}

function uninitalizeLibrary(activityName, packageName, cb) {
    var activityFolder = packageName.split('.').join(path.sep);
    var filename = activityName.split('.').join(path.sep);
    var Filepath = path.join('.', getCorrectPath(), "src", "main", "java", activityFolder, filename + ".java");
    var readMainActivity = fs.readFileSync(Filepath).toString();
    var pbinit = "Pushbots.sharedInstance().init(this);"
    var pbimport= "import com.pushbots.push.Pushbots;";

    resContent = readMainActivity.replace(pbinit, '');
    resContent = resContent.replace(pbimport, '');

    fs.writeFileSync(Filepath, resContent);
   


}