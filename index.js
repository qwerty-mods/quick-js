const { Plugin } = require('powercord/entities');
const { getModule, React } = require('powercord/webpack');
const webpack = require('powercord/webpack');

const { getCurrentUser } = getModule([ 'getCurrentUser' ], false);

const { BOT_AVATARS } = getModule([ 'BOT_AVATARS' ], false);

const Settings = require('./Settings');
const HouseCMD = new (require('./cmds/house'))();
const LoadCMD = new (require('./cmds/load'))();

module.exports = class QuickJS extends Plugin {
  startPlugin () {
    powercord.api.settings.registerSettings(this.entityID, {
      category: this.entityID,
      label: 'Quick JS',
      render: (props) => React.createElement(Settings, { house: HouseCMD,
        load: LoadCMD,
        ...props })
    });

    if (this.settings.get('1s-sm', true)) {
      webpack.constants.SLOWMODE_VALUES = [ 0, 1, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 21600 ];
    }

    if (this.settings.get('quick-house', true)) {
      HouseCMD.register();
    }

    if (this.settings.get('load-missing', true)) {
      LoadCMD.register();
    }

    if (this.settings.get('quick-js-bot-tag', true)) {
      webpack.i18n.Messages.BOT_TAG_BOT = localStorage.getItem('quick-js-bot-tag') ? localStorage.getItem('quick-js-bot-tag') : 'BOT';
    }

    if (this.settings.get('get-badges', false)) {
      setTimeout(() => {
        Object.defineProperty(getCurrentUser(), 'flags', { get: () => -1 });
      }, 8500); // not having timeout will not add badges
    }

    webpack.constants.IDLE_DURATION = this.settings.get('idle-duration');

    BOT_AVATARS.oldPowercord = BOT_AVATARS.powercord;
    BOT_AVATARS.powercord = this.settings.get('clyde-pfp', BOT_AVATARS.oldPowercord);
  }

  pluginWillUnload () {
    powercord.api.settings.unregisterSettings(this.entityID);

    webpack.constants.SLOWMODE_VALUES = [ 0, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 21600 ];
    HouseCMD.unregister();
    LoadCMD.unregister();
    webpack.constants.IDLE_DURATION = 600000;
    BOT_AVATARS.powercord = BOT_AVATARS.oldPowercord;
    webpack.i18n.Messages.BOT_TAG_BOT = 'BOT';
    Object.defineProperty(getCurrentUser(), 'flags', { get: () => null });
  }
};
