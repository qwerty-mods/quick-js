const { getModule } = require('powercord/webpack');

module.exports = class HouseCMD {
    register() {
        powercord.api.commands.registerCommand({
            command: 'house',
            usage: '{c} [house name]',
            description: 'Quickly Change your house',
            executor: this.house.bind(this),
            autocomplete: this.autocomplete.bind(this)
        });
    }

    unregister() {
        powercord.api.commands.unregisterCommand("house");
    }

    house([ id ]) {
        let house = id == "Bravery" ? "1" : id == "Brilliance" ? "2" : id == "Balance" ? "3" : null;
        if (house) {
            getModule(['joinHypeSquadOnline'], false).joinHypeSquadOnline({ houseID: `HOUSE_${house}` })
        }
    }    

    autocomplete([findId, ...args]) {
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
}