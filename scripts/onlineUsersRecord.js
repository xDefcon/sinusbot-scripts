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
    name: 'Online Users Record',
    version: '1.0',
    description: 'This script will monitor and save in a channel the highest number of concurrent online users',
    author: 'Luigi M. - xDefcon (xdefconhd@gmail.com)',
    vars: {
        channel: {
            title: 'Channel to be updated', type: 'channel'
        }, delayTime: {
            title: 'Run a check every [seconds]',
            type: 'number',
            placeholder: 'Check online users every... (Default: 20sec).'
        }, customString: {
            title: 'Channel name (use %u to indicate the users record)',
            type: 'string',
            placeholder: 'Change the name of the channel (Example: Max online users: %u)'
        }, debugSwitch: {
            title: 'Enable debug messages?', type: 'select', options: ['no', 'yes']
        }
    }
}, function (sinusbot, config) {
    if (typeof config.debugSwitch === 'undefined') {
        config.debugSwitch = 0;
    }
    if (typeof config.delayTime === 'undefined') {
        config.delayTime = 20;
        debug("Check delay set to 20 seconds.");
    } else if (config.delayTime < 2) {
        debug("To avoid lag/crashes, the delay MUST be greater than 2 seconds."); config.delayTime = 3;
        debug("Delay set to 3 seconds.");
    } else {
        debug("Check delay set to " + config.delayTime + " seconds.");
    }
    if (typeof config.channel === 'undefined') {
        debug("No channel selected, SCRIPT STOPPED.");
        return;
    }

    setInterval(onlineCheck, config.delayTime * 1000);

    function debug(msg) {
        if (config.debugSwitch == 1) {
            sinusbot.log("[DEBUG] " + msg);
        }
    }

    function onlineCheck() {
        var nowOnline = getClients();
        var chanOnline = 0;
        var channel = sinusbot.getChannel(config.channel);
        var name = channel.name;
        var confClearName = config.customString.replace("%u", "");
        var chanName;

        var firstOccur = name.indexOf(confClearName);

        if (firstOccur === -1) {
            debug("Channel not updated, updating now with " + nowOnline + " users online.");
            chanName = config.customString.replace("%u", nowOnline);
            sinusbot.channelUpdate(config.channel, {name: chanName});
        } else {
            if (firstOccur === 0) {
                chanOnline = name.substring(confClearName.length);
            } else {
                chanOnline = name.substring(0, firstOccur);
                chanOnline += name.substring(firstOccur + confClearName.length);
            }
            if (parseInt(chanOnline, 10) < nowOnline) {
                chanName = config.customString.replace("%u", nowOnline);
                sinusbot.channelUpdate(config.channel, {name: chanName});
            } else {
                debug("There are " + nowOnline + " users connected, the record is " + chanOnline);
                debug("Channel not updated.");
            }
        }
    }

    function getClients() {
        var channel, channels, x = 0;
        channels = sinusbot.getChannels();
        for (var i = 0; i < channels.length; i++) {
            channel = channels[i];
            x += channel.clients.length;
        }
        return x;
    }
});
