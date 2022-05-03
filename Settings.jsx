const { React, getModule } = require('powercord/webpack');
const webpack = require('powercord/webpack');
const { SwitchItem, TextInput } = require('powercord/components/settings');

const { getCurrentUser } = getModule([ 'getCurrentUser' ], false);

const { BOT_AVATARS } = getModule([ 'BOT_AVATARS' ], false);

const isValidUrl = function isValidUrl (string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
};

module.exports = class Settings extends React.PureComponent {
  constructor (props) {
    super(props);

    this._setState(false);
  }

  _setState (update) {
    const state = {
      isIdleValid: Number(this.props.getSetting('idle-duration', 600000)),
      initialIdleValue: this.props.getSetting('idle-duration', 600000),
      idleValue: this.props.getSetting('idle-duration', 600000),
      clydeImg: this.props.getSetting('clyde-pfp', BOT_AVATARS.oldPowercord),
      clydeImgValid: isValidUrl(this.props.getSetting('clyde-pfp', BOT_AVATARS.oldPowercord)),
      initialclydeImg: this.props.getSetting('clyde-pfp', BOT_AVATARS.oldPowercord)
    };

    if (update) {
      this.setState(state);
    } else {
      this.state = state;
    }
  }

  render () {
    const { getSetting, toggleSetting, updateSetting, house: HouseCMD, load: LoadCMD } = this.props;
    return (
      <div>
        <SwitchItem
          onChange={() => {
            toggleSetting('1s-sm');
            if (getSetting('1s-sm', true)) {
              webpack.constants.SLOWMODE_VALUES = [ 0, 1, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 21600 ];
            } else {
              webpack.constants.SLOWMODE_VALUES = [ 0, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 21600 ];
            }
          }}
          value={getSetting('1s-sm', true)}
          note="Adds a 1s option to the slowmode slider."
        >1s Slowmode Setting</SwitchItem>
        <SwitchItem
          onChange={() => {
            toggleSetting('quick-house');
            if (getSetting('quick-house', true)) {
              HouseCMD.register();
            } else {
              HouseCMD.unregister();
            }
          }}
          value={getSetting('quick-house', true)}
          note="A command that allows you to switch houses easily."
        >Quick House Changer</SwitchItem>
        <SwitchItem
          onChange={() => {
            toggleSetting('load-missing');
            if (getSetting('load-missing', true)) {
              LoadCMD.register();
            } else {
              LoadCMD.unregister();
            }
          }}
          value={getSetting('load-missing', true)}
          note="A command that allows you to load any missing plugins/themes."
        >Load Missing Plugins/Themes</SwitchItem>
        <SwitchItem
          onChange={() => {
            toggleSetting('mute-all-guilds');
            if (getSetting('mute-all-guilds', true)) {
              for (const id in webpack.getModule([ 'getGuild' ], false).getGuilds()) {
                webpack.getModule([ 'updateGuildNotificationSettings' ], false).updateGuildNotificationSettings(id, { muted: true });
              }
            } else {
              for (const id in webpack.getModule([ 'getGuild' ], false).getGuilds()) {
                webpack.getModule([ 'updateGuildNotificationSettings' ], false).updateGuildNotificationSettings(id, { muted: false });
              }
            }
          }}
          value={getSetting('mute-all-guilds', true)}
          note="Mute or unmute every server you are currently in. It is recommended that you do not click this too many times in a short time frame."
        >Toggle mute for all servers you're in</SwitchItem>
        <SwitchItem
          onChange={() => {
            toggleSetting('get-badges');
            if (getSetting('get-badges', true)) {
              Object.defineProperty(getCurrentUser(), 'flags', { get: () => 219087 });
            } else {
              Object.defineProperty(getCurrentUser(), 'flags', { get: () => null });
            }
          }}
          value={getSetting('get-badges', true)}
          note="Give yourself every Discord badge. This is client-side only, meaning no one else can see them."
        >Toggle all badges</SwitchItem>
        <TextInput
          value={this.state.isIdleValid ? getSetting('idle-duration') : this.state.idleValue}
          note="Choose the amount of time in MILLISECONDS before discord automatically turns you IDLE. Default is 600000."
          style={!this.state.isIdleValid ? { borderColor: 'red' } : {}}
          onChange={(value) => {
            if (Number(value)) {
              this.setState({ isIdleValid: true });
              updateSetting('idle-duration', value);
              webpack.constants.IDLE_DURATION = parseInt(value);
            } else {
              this.setState({ isIdleValid: false,
                idleValue: value });
              updateSetting('idle-duration', this.state.initialIdleValue);
            }
          }}
        >Auto-IDLE Time</TextInput>
        <TextInput
          value={this.state.clydeImg ? getSetting('clyde-pfp', BOT_AVATARS.oldPowercord) : this.state.clydeImg}
          note="Change the pfp of Clyde. Make sure that eradicating Clyde is enabled in settings. Default is https://tinyurl.com/powercord-clyde"
          style={!this.state.clydeImgValid ? { borderColor: 'red' } : {}}
          onChange={(value) => {
            if (isValidUrl(value)) {
              this.setState({ clydeImgValid: true });
              updateSetting('clyde-pfp', value);
              BOT_AVATARS.powercord = value;
            } else {
              this.setState({ clydeImgValid: false,
                clydeImg: value });
              updateSetting('clyde-pfp', this.state.initialclydeImg);
            }
          }}
        >Force Change Clyde PFP</TextInput>
        <TextInput
          placeholder={webpack.i18n.Messages.BOT_TAG_BOT}
          note="Change the text that will be inside of the BOT tag next to bots."
          onChange={(value) => {
            webpack.i18n.Messages.BOT_TAG_BOT = value;
            localStorage.setItem('quick-js-bot-tag', value);
          }}
        >Change the <span class="botTag-2mryIa botTagRegular-kpctgU botTag-7aX5WZ px-MnE_OR"><span class="botText-1fD6Qk">BOT</span></span>&nbsp; tag text</TextInput>
      </div>
    );
  }
};
