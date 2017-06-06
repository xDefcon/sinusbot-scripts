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
 * @author Luigi Martinelli <luigi@xdefcon.com>
 *
 */


registerPlugin({
    name: 'Animated Channel',
    version: '1.0',
    description: 'This scripts allows you to have a custom animated channel name/description, ',
    author: 'Luigi M. - xDefcon (luigi@xdefcon.com)',
    vars: {
        enableSwitch: {
            title: "Activate the script?", type: "select", options: ["no", "yes"]
        }, animatedMode: {
            title: "Animated mode [name/desc/both]",
            type: "select",
            options: ["channel name", "channel description", "name + description"]
        }, delayTime: {
            title: "Name/Desc changer delay [milliseconds]",
            type: "number",
            placeholder: "Change name/description every... (Default: 1000ms)."
        }, animatedChannel: {
            title: "Channel that will be AnImAtEd!",
            type: "channel",
            placeholder: "Select a channel where you want to kick some fun in :)"
        }, customNames: {
            title: "Channel names list",
            type: "string",
            placeholder: "A comma separated list of channel names (e.g: CHANNEL 1, CHANNEL 2, CHANNEL 3)."
        }, customDescs: {
            title: "Channel descriptions list",
            type: "string",
            placeholder: "A comma separated list of channel descriptions (e.g: [IMG]link[/IMG],[IMG]link2[/IMG],text3)."
        }, adminUUID: {
            title: "Command admin UUIDs",
            type: "string",
            placeholder: "A comma separated list of Unique IDs of admins to run the !animatedchan commands"
        }, debugSwitch: {
            title: "Enable debug messages?", type: "select", options: ["no", "yes"]
        }
    }
}, function (sinusbot, config) {
    var engine = require("engine");
    var event = require("event");
    var backend = require("backend");
    var minimumDelay = 100, i = 0, j = 0, chanObj = backend.getChannelByID(config.animatedChannel), initialChanName = chanObj.name();

    var adminUUID = [];

    if (typeof config.enableSwitch == "undefined") {
        config.enableSwitch = false;
    }
    if (typeof config.animatedMode == "undefined") {
        config.animatedMode = 0;
        debug("No mode selected, selecting NAME mode...")
    }
    if (typeof config.debugSwitch == "undefined") {
        config.debugSwitch = 0;
    }
    if (config.adminUUID) {
        adminUUID = config.adminUUID.split(",");
        debug(adminUUID.length + " Admin UUIDs loaded.")
    } else {
        debug("No Admin UUIDs found.");
    }
    if (typeof config.delayTime == "undefined") {
        config.delayTime = 1000;
        debug("Name/Desc changer delay set to 1000ms.");
    } else if (config.delayTime < minimumDelay) {
        debug("To avoid lag/crashes, the delay MUST be greater than 100 milliseconds.");
        config.delayTime = 1000;
        debug("Delay set to 1 second.");
    } else {
        debug("Name/Desc changer delay set to " + config.delayTime + ".");
    }
    if (typeof config.customNames == config.customDescs == "undefined") {
        debug("[WARN] In order to run the script, please fill channel names or channel descriptions list. SCRIPT STOPPED.");
        return;
    }

    var intervalN = setInterval(chanChange, config.delayTime);
    event.on("chat", function (ev) {
        var message = ev.text;
        if (adminUUID.indexOf(ev.client.uniqueID()) >= 0) {
            switch (message) {
                case "!animatedchan on":
                    config.enableSwitch = 1;
                    debug("Enabling script by command.");
                    break;
                case "!animatedchan off":
                    config.enableSwitch = 0;
                    debug("Disabling script by command.");
                    if (config.animatedMode == 0) chanObj.setName(initialChanName);
                    if (config.animatedMode == 1) chanObj.setDescription(" ");
                    if (config.animatedMode == 2) {
                        chanObj.setDescription(" ");
                        chanObj.setName(initialChanName);
                    }
                    break;
                default:
                    var split = message.split(" ");
                    if (split[0] + " " + split[1] == "!animatedchan mode") {
                        switch (split[2]) {
                            case "name":
                                config.animatedMode = 0;
                                ev.client.chat("Animated mode set to: channel name.");
                                debug("Animated mode set to: channel name via COMMAND by: " + ev.client.uniqueID());
                                break;
                            case "description":
                                config.animatedMode = 1;
                                ev.client.chat("Animated mode set to: description.");
                                debug("Animated mode set to: description via COMMAND by: " + ev.client.uniqueID());
                                break;
                            case "both":
                                config.animatedMode = 2;
                                ev.client.chat("Animated mode set to: channel name + description.");
                                debug("Animated mode set to: channel name + description via COMMAND by: " + ev.client.uniqueID());
                                break;
                            default:
                                ev.client.chat("Unknown mode for '" + split[2] + "', valid ones are: 'name', 'description' and 'both'.");
                                break;
                        }
                    }
                    else if (split[0] + " " + split[1] == "!animatedchan delay") {
                        if (!isNaN(split[2])) {
                            var msgDelay = parseInt(split[2]);
                            if (msgDelay < minimumDelay) {
                                ev.client.chat("To avoid lag/crashes, the delay MUST be greater than 100 milliseconds.");
                            } else {
                                config.delayTime = msgDelay;
                                clearInterval(intervalN);
                                intervalN = setInterval(chanChange, config.delayTime);
                                ev.client.chat("Delay time set to: " + msgDelay + " milliseconds.");
                                debug("Delay time set to: " + msgDelay + " by: " + ev.clientUid);
                            }
                        }
                    }
                    break;
            }
        }
    });

    function chanChange() {
        if (!config.enableSwitch) return;
        var chanArr = {
            names: config.customNames.split(","), descs: config.customDescs.split(",")
        }
        debug("Found " + chanArr["names"].length + " channel names.");
        debug("Found " + chanArr["descs"].length + " channel descriptions.");
        if (i >= chanArr["names"].length) {
            i = 1;
            if (config.animatedMode != 1) chanObj.setName(chanArr["names"][0]);
            debug("Reset counter.");
        } else {
            if (config.animatedMode != 1) chanObj.setName(chanArr["names"][i]);
            i++;
        }
        if (j >= chanArr["descs"].length) {
            j = 1;
            if (config.animatedMode != 0) chanObj.setDescription(chanArr["descs"][0]);
            debug("Reset counter 2.");
        } else {
            if (config.animatedMode != 0) chanObj.setDescription(chanArr["descs"][j]);
            j++;
        }
    }

    function debug(msg) {
        if (config.debugSwitch == 1) {
            engine.log("[DEBUG] " + msg);
        }
    }
});
