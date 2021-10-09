const { Plugin } = require('powercord/entities');
const { getModule } = require('powercord/webpack');
const webpack = require('powercord/webpack');

const Settings = require('./Settings')

module.exports = class QuickJS extends Plugin {
    startPlugin() {
        powercord.api.settings.registerSettings(this.entityID, {
            category: this.entityID,
            label: 'Quick JS',
            render: Settings
        });

        if (this.settings.get("1s-sm", true)) {
            webpack.constants.SLOWMODE_VALUES = [0, 1, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 21600];
        }

        if (this.settings.get("quick-house", true)) {
            powercord.api.commands.registerCommand({
                command: 'house',
                usage: '{c} [house name]',
                description: 'Quickly Change your house',
                executor: this.quick_house.bind(this),
                autocomplete: this.house_autocomplete.bind(this)
            });
        }

        if (this.settings.get("load-missing", true)) {
            powercord.api.commands.registerCommand({
                command: 'load',
                usage: '{c} [type]',
                description: 'Load missing Themes/Plugins',
                executor: this.load_missing.bind(this),
                autocomplete: this.load_autocomplete.bind(this)
            });
        }

        webpack.constants.IDLE_DURATION = this.settings.get("idle-duration");
    }

    pluginWillUnload() {
        powercord.api.settings.unregisterSettings(this.entityID)

        webpack.constants.SLOWMODE_VALUES = [0, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 21600];
        powercord.api.commands.unregisterCommand("house");
        powercord.api.commands.unregisterCommand("load");
        webpack.constants.IDLE_DURATION = 600000;
    }

    async quick_house([ id ]) {
        let house = id == "Bravery" ? "1" : id == "Brilliance" ? "2" : id == Balance ? "3" : null;
        if (house) {
            (await getModule(['joinHypeSquadOnline'])).joinHypeSquadOnline({ houseID: `HOUSE_${house}` })
        }
    }    

    house_autocomplete([findId, ...args]) {
        if (args.length) {
            return false;
        }
        return {
            commands: ["Bravery", "Brilliance", "Balance"]
            .filter((id) => id.includes(findId))
            .map((id) => ({ command: id })),
            header: 'houses list',
        };
    }

    load_missing([ id ]) {
        powercord.pluginManager.get('pc-moduleManager')._fetchEntities(id);
    }

    load_autocomplete([findId, ...args]) {
        if (args.length) {
            return false;
        }
        return {
            commands: ["plugins", "themes"]
            .filter((id) => id.includes(findId))
            .map((id) => ({ command: id })),
            header: 'type',
        };
    }
}