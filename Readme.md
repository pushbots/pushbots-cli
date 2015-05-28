# PushBots CLI

PushBots command line interface. 


Want to quickly set-up your app for notifications from your terminal? 

Install PushBots in your Android and Phonegap application in litterally a few seconds. PushBots CLI will download our SDK, edit your manifest and do all the work for you. You are only two steps away from pure magic.


#install
To install pushbots-cli from npm, run:

```
$ npm install -g pushbots-cli
```

```pushbots --help```


# Usage


##install

```
$ pushbots install
```

Navigate to your Android project folder (Eclipse/Android Studio) or Phonegap project and run the command and PushBots CLI will download our SDK, edit your manifest and do all the work for you. 



##remove

```
$ pushbots remove
```
Remove pushbots installed in your project.


##test

```
$ pushbots test
```
Send a test push notifications to your device. 

##configure

```
$ pushbots config
```
Change APPID, APP SECRET, or GCM Sender ID.



# Acknowledgments

Built using [generator-commader](https://github.com/Hypercubed/generator-commander).

Thanks for [@drmas](https://github.com/drmas) for his contributions.

# License

Copyright (c) 2015 PushBots

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
