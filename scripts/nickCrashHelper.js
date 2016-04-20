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
        name: 'Nick Crash Helper',
        version: '1.1',
        description: 'This script removes the awful "1" after the nickname (This can happen when the bot crashes).',
        author: 'Luigi M. - xDefcon (xdefconhd@gmail.com)',
        vars: {
            checkTime: {
                title: 'Check Time [seconds]',
                type: 'number',
                placeholder: 'Run a nickname check every... (Default: 60)'
            },

            debugSwitch: {
                title: 'Enable debug messages?',
                type: 'select',
                options: [
                    'no',
                    'yes'
                ]
            },

        }
    },


    function(sinusbot, config) {

        if (typeof config.checkTime == 'undefined') {
            config.checkTime = 60;
            debug("Check Time set to 60 seconds.");
        } else {
            debug("Check Time set to " + config.checkTime + ".");
        }


        function debug(msg) {
            if (config.debugSwitch == 1) {
                sinusbot.log("[DEBUG] " + msg);
            }
        }


        setInterval(nickCheck, config.checkTime * 1000);


        function nickCheck() {
            var i = 1,
                j = 0,
                nick = sinusbot.getNick(),
                length = nick.length;

            while (nick.charAt(length - i) == '1') {
                i++;
                j++;
            }

            nick = nick.substring(0, length - j);

            if (j != 0) {
                sinusbot.setNick(nick);
                debug("Nick set to " + nick + " (found " + j + " crash-numbers after the nick.)");
            } else {
                debug("Nick not modified, all seems normal :)");
            }

        }

    });