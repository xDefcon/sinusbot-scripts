/*
 * Copyright (C) 2016 Luigi Martinelli <xdefconhd@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @author Luigi Martinelli <xdefconhd@gmail.com>
 *
 */


registerPlugin({
        name: 'Animated Nickname',
        version: '1.0',
        description: 'This scripts kicks some fun in your bot, you can set a custom animated nickname or description.',
        author: 'Luigi M. - xDefcon (xdefconhd@gmail.com)',
        vars: {
            enableSwitch: {
                title: 'Activate the script?',
                type: 'select',
                options: [
                    'no',
                    'yes'
                ]
            },

            delayTime: {
                title: 'Nick changer delay [milliseconds]',
                type: 'number',
                placeholder: 'Change nick every... (Default: 1000ms).'
            },

            customNicks: {
                title: 'Nicknames list',
                type: 'string',
                placeholder: 'A comma separated list of nicks (e.g: BOT 1,BOT 2,BOT 3).'
            },

            adminUUID: {
                title: 'Command admin UUIDs',
                type: 'string',
                placeholder: 'A comma separated list of Unique IDs of admins to run the !animated on/off command'
            },

            debugSwitch: {
                title: 'Enable debug messages?',
                type: 'select',
                options: [
                    'no',
                    'yes'
                ]
            }
        }
    },


    function(sinusbot, config) {

        var i = 0;
        var adminUUID = [];
        var initialNick = sinusbot.getNick();

        if (typeof config.enableSwitch == 'undefined') {
            config.enableSwitch = false;
        }

        if (typeof config.debugSwitch == 'undefined') {
            config.debugSwitch = 0;
        }

        if (config.adminUUID) {
            adminUUID = config.adminUUID.split(',');
            debug(adminUUID.length + " Admin UUIDs loaded.")
        } else {
            debug("No Admin UUIDs found.");
        }

        if (typeof config.delayTime == 'undefined') {
            config.delayTime = 1000;
            debug("Nick changer delay set to 1000ms.");
        } else if (config.delayTime < 200){
            debug("To avoid lag/crashes, the delay MUST be greater than 200 milliseconds.");
            config.delayTime = 1000;
            debug("Delay set to 1 second.");
        } else {
            debug("Nick changer delay set to " + config.delayTime + ".");
        }

        if (typeof config.customNicks == 'undefined') {
            debug("Nickname list empty or wrong, SCRIPT STOPPED.");
            return;
        }

        setInterval(nickChange, config.delayTime);

        sinusbot.on('chat', function(ev) {
            var message = ev.msg;
            if(adminUUID.indexOf(ev.clientUid) >= 0){
                switch(message) {
                    case '!animated on':
                        config.enableSwitch = 1;
                        break;

                    case '!animated off':
                        config.enableSwitch = 0;
                        sinusbot.setNick(initialNick);
                        break;
                }
            }
        });

        function debug(msg) {
            if (config.debugSwitch == 1) {
                sinusbot.log("[DEBUG] " + msg);
            }
        }

        function nickChange() {
            if (!config.enableSwitch) return;

            var nickArr = config.customNicks.split(',');
            debug("Found " + nickArr.length + "nicknames.");

            if (i >= nickArr.length){
                i = 1;
                sinusbot.setNick(nickArr[0]);
                debug("Resetted counter.");
            } else {
                sinusbot.setNick(nickArr[i]);
                i++;
            }
        }
    });
