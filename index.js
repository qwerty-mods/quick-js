const { Plugin } = require('powercord/entities');
const { getModule, React } = require('powercord/webpack');
const webpack = require('powercord/webpack');

const Settings = require('./Settings');
const HouseCMD = new (require('./cmds/house'))();
const LoadCMD = new (require('./cmds/load'))();

module.exports = class QuickJS extends Plugin {
    startPlugin() {
        powercord.api.settings.registerSettings(this.entityID, {
            category: this.entityID,
            label: 'Quick JS',
            render: (props) => React.createElement(Settings, {house: HouseCMD, load: LoadCMD, ...props})
        });

        if (this.settings.get("1s-sm", true)) {
            webpack.constants.SLOWMODE_VALUES = [0, 1, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 21600];
        }

        if (this.settings.get("quick-house", true)) {
            HouseCMD.register()
        }

        if (this.settings.get("load-missing", true)) {
            LoadCMD.register()
        }

        webpack.constants.IDLE_DURATION = this.settings.get("idle-duration");
    }

    pluginWillUnload() {
        powercord.api.settings.unregisterSettings(this.entityID)

        webpack.constants.SLOWMODE_VALUES = [0, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 21600];
        HouseCMD.unregister()
        LoadCMD.unregister()
        webpack.constants.IDLE_DURATION = 600000;
    }
}