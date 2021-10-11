module.exports = class LoadCMD {
    register() {
        powercord.api.commands.registerCommand({
            command: 'load',
            usage: '{c} [type]',
            description: 'Load missing Themes/Plugins',
            executor: this.load_missing.bind(this),
            autocomplete: this.autocomplete.bind(this)
        });
    }

    unregister() {
        powercord.api.commands.unregisterCommand('load')
    }

    load_missing([ id ]) {
        powercord.pluginManager.get('pc-moduleManager')._fetchEntities(id);
    }

    autocomplete([findId, ...args]) {
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