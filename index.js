const { Plugin } = require('powercord/entities');
const { getModule, React } = require('powercord/webpack');
const webpack = require('powercord/webpack');

const { BOT_AVATARS } = getModule(["BOT_AVATARS"], false);

const Settings = require('./Settings');
const HouseCMD = new (require('./cmds/house'))();
const LoadCMD = new (require('./cmds/load'))();

module.exports = class QuickJS extends Plugin {
    startPlugin() {
        powercord.api.settings.registerSettings(this.entityID, {
            category: this.entityID,
            label: 'Quick JS',
            render: (props) => React.createElement(Settings, { house: HouseCMD, load: LoadCMD, ...props })
        });

        if (this.settings.get("1s-sm", true)) {
            webpack.constants.SLOWMODE_VALUES = [0, 1, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 21600];
        }

        if (this.settings.get("quick-house", true)) {
            HouseCMD.register();
        }

        if (this.settings.get("load-missing", true)) {
            LoadCMD.register();
        }

        // if (this.settings.get("mute-all-guilds"), true) {
        //     setTimeout(() => {
        //         for (let id in webpack.getModule(['getGuild'], false).getGuilds()) {
        //             webpack.getModule(['updateGuildNotificationSettings'], false).updateGuildNotificationSettings(id, { muted: true });
        //         }
        //     }, 10000); // this makes a lot of requests, so we will load it after some time
        // } // having this run every time the user reloads discord is probably a bad idea, as the user will be making 100+ requests (or less, depends on their server count) each time

        if (this.settings.get("get-badges"), true) {
            setTimeout(() => { Object.defineProperty(require('powercord/webpack').getModule(['getCurrentUser'], false).getCurrentUser(), 'flags', { get: () => -1 }); }, 8500); // not having timeout will not add badges
        }

        webpack.constants.IDLE_DURATION = this.settings.get("idle-duration");

        BOT_AVATARS.oldPowercord = BOT_AVATARS.powercord;
        BOT_AVATARS.powercord = this.settings.get("clyde-pfp", BOT_AVATARS.oldPowercord);
    }

    pluginWillUnload() {
        powercord.api.settings.unregisterSettings(this.entityID)

        webpack.constants.SLOWMODE_VALUES = [0, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 21600];
        HouseCMD.unregister()
        LoadCMD.unregister()
        webpack.constants.IDLE_DURATION = 600000;
        BOT_AVATARS.powercord = BOT_AVATARS.oldPowercord;
        // for (let id in webpack.getModule(['getGuild'], false).getGuilds()) {
        //     webpack.getModule(['updateGuildNotificationSettings'], false).updateGuildNotificationSettings(id, { muted: false });
        // }
        Object.defineProperty(require('powercord/webpack').getModule(['getCurrentUser'], false).getCurrentUser(), 'flags', { get: () => null });
    }
}