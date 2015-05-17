/* list commander component
 * To use add require('../cmds/list.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';
var prompt = require('prompt');
var request = require('request');
var fs = require('fs');
var FileCookieStore = require('tough-cookie-filestore');
request.defaults();

module.exports = function(program) {

    program
        .command('list')
        .version('0.0.1')
        .description('A commander command')
        .action(function( /* Args here */ ) {
            var j;
            if (fs.existsSync('cookies.json')) {
            	console.log('setting cookies');
                j = request.jar(new FileCookieStore('cookies.json'));
            } else {
                j = request.jar();
            }

            request({
                url: 'https://pushbots.com/dashboard',
                jar: j
            }, function(err, response, body) {
            	console.log(response.statusCode);
                if (err) return console.log(err);
                var cookies = j.getCookies('https://pushbots.com/dashboard');
                console.log(cookies);
                // console.log(body);
                // if (response.statusCode == 200 || response.statusCode == 302) {
                    console.log(body);

                // }

            });
        });

};