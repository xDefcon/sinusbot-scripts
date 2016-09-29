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
    name: "Animated Nickname",
    version: "1.4",
    description: "This scripts kicks some fun in your bot, you can set a custom animated nickname or description.",
    author: "Luigi M. - xDefcon (xdefconhd@gmail.com)",
    vars: {
        enableSwitch: {
            title: "Activate the script?", type: "select", options: ["no", "yes"]
        }, animatedMode: {
            title: "Animated mode [nick/desc/both]",
            type: "select",
            options: ["nickname", "description", "nickname + description"]
        }, delayTime: {
            title: "Nick/Desc changer delay [milliseconds]",
            type: "number",
            placeholder: "Change nick/description every... (Default: 1000ms)."
        }, customNicks: {
            title: "Nicknames list",
            type: "string",
            placeholder: "A comma separated list of nicks/descs (e.g: BOT 1,BOT 2,BOT 3)."
        }, adminUUID: {
            title: "Command admin UUIDs",
            type: "string",
            placeholder: "A comma separated list of Unique IDs of admins to run the !animated on/off command"
        }, debugSwitch: {
            title: "Enable debug messages?", type: "select", options: ["no", "yes"]
        }
    }
}, function (sinusbot, config) {
    var i = 0;
    var minimumDelay = 100;
    var adminUUID = [];
    var initialNick = sinusbot.getNick();
    if (typeof config.enableSwitch == "undefined") {
        config.enableSwitch = false;
    }
    if (typeof config.animatedMode == "undefined") {
        config.animatedMode = 0;
        debug("No mode selected, selecting NICK mode...")
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
        debug("Nick/Desc changer delay set to 1000ms.");
    } else if (config.delayTime < minimumDelay) {
        debug("To avoid lag/crashes, the delay MUST be greater than 100 milliseconds.");
        config.delayTime = 1000;
        debug("Delay set to 1 second.");
    } else {
        debug("Nick/Desc changer delay set to " + config.delayTime + ".");
    }
    if (typeof config.customNicks == "undefined") {
        debug("Nickname/description list empty or wrong, SCRIPT STOPPED.");
        return;
    }

    var intervalN = setInterval(nickChange, config.delayTime);
    sinusbot.on("chat", function (ev) {
        var message = ev.msg;
        if (adminUUID.indexOf(ev.clientUid) >= 0) {
            switch (message) {
                case "!animated on":
                    config.enableSwitch = 1;
                    debug("Enabling script by command.");
                    break;
                case "!animated off":
                    config.enableSwitch = 0;
                    debug("Disabling script by command.");
                    if (config.animatedMode == 0) sinusbot.setNick(initialNick);
                    if (config.animatedMode == 1) sinusbot.setDescription(" ");
                    if (config.animatedMode == 2) {
                        sinusbot.setDescription(" ");
                        sinusbot.setNick(initialNick);
                    }
                    break;
                default:
                    var split = message.split(" ");
                    if (split[0] + " " + split[1] == "!animated mode") {
                        switch (split[2]) {
                            case "nickname":
                                config.animatedMode = 0;
                                sinusbot.chatPrivate(ev.clientId, "Animated mode set to: nickname.");
                                debug("Animated mode set to: nickname via COMMAND by: " + ev.clientUid);
                                break;
                            case "description":
                                config.animatedMode = 1;
                                sinusbot.chatPrivate(ev.clientId, "Animated mode set to: description.");
                                debug("Animated mode set to: description via COMMAND by: " + ev.clientUid);
                                break;
                            case "both":
                                config.animatedMode = 2;
                                sinusbot.chatPrivate(ev.clientId, "Animated mode set to: nickname + description.");
                                debug("Animated mode set to: nickname + description via COMMAND by: " + ev.clientUid);
                                break;
                            default:
                                sinusbot.chatPrivate(ev.clientId, "Unknown mode for '" + split[2] + "', valid ones are: 'nickname', 'description' and 'both'.");
                                break;
                        }
                    }
                    if (split[0] + " " + split[1] == "!animated delay") {
                        if (!isNaN(split[2])) {
                            var msgDelay = parseInt(split[2]);
                            if (msgDelay < minimumDelay) {
                                sinusbot.chatPrivate(ev.clientId, "To avoid lag/crashes, the delay MUST be greater than 100 milliseconds.");
                            } else {
                                config.delayTime = msgDelay;
                                clearInterval(intervalN);
                                intervalN = setInterval(nickChange, config.delayTime);
                                sinusbot.chatPrivate(ev.clientId, "Delay time set to: " + msgDelay + " milliseconds.");
                                debug("Delay time set to: " + msgDelay +" by: " + ev.clientUid);}
                        }
                    }
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
        var nickArr = config.customNicks.split(",");
        debug("Found " + nickArr.length + " nickname(s)/description(s).");
        if (i >= nickArr.length) {
            i = 1;
            if (config.animatedMode == 0) sinusbot.setNick(nickArr[0]);
            if (config.animatedMode == 1) sinusbot.setDescription(nickArr[0]);
            if (config.animatedMode == 2) {
                sinusbot.setNick(nickArr[0]);
                sinusbot.setDescription(nickArr[0]);
            }
            debug("Reset counter.");
        } else {
            if (config.animatedMode == 0) sinusbot.setNick(nickArr[i]);
            if (config.animatedMode == 1) sinusbot.setDescription(nickArr[i]);
            if (config.animatedMode == 2) {
                sinusbot.setNick(nickArr[i]);
                sinusbot.setDescription(nickArr[i]);
            }
            i++;
        }
    }
});
