const { React, getModule } = require('powercord/webpack');
const webpack = require('powercord/webpack');
const { SwitchItem, TextInput } = require('powercord/components/settings');

const { createAlertModal, createPromptModal } = require('./modals.js');

const { getCurrentUser } = getModule(['getCurrentUser'], false);

const { BOT_AVATARS } = getModule(['BOT_AVATARS'], false);

const isValidUrl = function isValidUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
};

module.exports = class Settings extends React.PureComponent {
  constructor(props) {
    super(props);

    this._setState(false);
  }

  _setState(update) {
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

  render() {
    const { getSetting, toggleSetting, updateSetting, house: HouseCMD, load: LoadCMD } = this.props;
    return (
      <div>
        <SwitchItem
          onChange={() => {
            toggleSetting('1s-sm');
            if (getSetting('1s-sm', true)) {
              webpack.constants.SLOWMODE_VALUES = [0, 1, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 21600];
            } else {
              webpack.constants.SLOWMODE_VALUES = [0, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 21600];
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
          onChange={async() => {
            const { getGuilds } = await getModule(['getGuilds']);
            const guildCount = await Object.keys(getGuilds()).length
            createAlertModal("Toggle mute for all servers you're in?", `${guildCount >= 35 ? `You are currently in **${guildCount}** servers, your client may temporarily slow down or freeze due to the amount of requests that are made. ` : ""}Toggling this too quickly in a short amount of time may cause issues that this plugin will not be responsible for. Continue?`).then(res => {
              if (res) {
                toggleSetting('mute-all-guilds');
                if (getSetting('mute-all-guilds', true)) {
                  for (const id in webpack.getModule(['getGuild'], false).getGuilds()) {
                    webpack.getModule(['updateGuildNotificationSettings'], false).updateGuildNotificationSettings(id, { muted: true });
                  }
                } else {
                  for (const id in webpack.getModule(['getGuild'], false).getGuilds()) {
                    webpack.getModule(['updateGuildNotificationSettings'], false).updateGuildNotificationSettings(id, { muted: false });
                  }
                }
                Object.defineProperty(getCurrentUser(), 'flags', { get: () => -1 });
              } else {
                console.log("Mute toggle aborted!");
              }
            })
          }}
          value={getSetting('mute-all-guilds', true)}
          note="Mute or unmute every server you are currently in. It is recommended that you do not click this too many times in a short time frame."
        >Toggle mute for all servers you're in</SwitchItem>
        <SwitchItem
          onChange={() => {
            toggleSetting('get-flags');
            if (getSetting('get-flags', false)) {
              createAlertModal("Enable all flags?", "Enabling all flags may cause some features to break, and this plugin is not responsible for any crashes or errors that arise from toggling this feature. Continue?").then(res => {
                if (res) {
                  Object.defineProperty(getCurrentUser(), 'flags', { get: () => -1 });
                } else {
                  toggleSetting('get-flags');
                }
              })
            } else {
              Object.defineProperty(getCurrentUser(), 'flags', { get: () => null });
            }
          }}
          value={getSetting('get-flags', false)}
          note="Give yourself every Discord flag, which can also give you every available badge. This is client-side only and may cause issues with some features."
        >Toggle all flags</SwitchItem>
        <SwitchItem
          onChange={() => toggleSetting('remove-gif')}
          value={getSetting('remove-gif', false)}
          note="Remove the GIF button from channels that you don't have embed perms on."
        >Remove GIF Buttons</SwitchItem>
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
              this.setState({
                isIdleValid: false,
                idleValue: value
              });
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
              this.setState({
                clydeImgValid: false,
                clydeImg: value
              });
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
        <TextInput
          placeholder="Insert a Guild ID"
          note="Add or modify Guild features."
          onChange={(serverid) => {
            serverid = serverid.trim();

            if (/^[0-9]{18,19}$/m.test(serverid)) {
              createPromptModal("Enter the Guild feature that you would like to add").then(feature => feature.toUpperCase().trim()).then(feature => {
                // This if statement check can be uncommented and it will only allow VERIFIED or PARTNERED.
                // if (feature === 'VERIFIED' || feature === 'PARTNERED') {
                  window.webpackChunkdiscord_app.push([[Math.random()], {}, (req) => { for (const m of Object.keys(req.c).map((x) => req.c[x].exports).filter((x) => x)) { if (m.default && m.default.getGuilds !== undefined) { return m.default.getGuild(serverid).features.add(feature) } if (m.getGuilds !== undefined) { return m.getGuild(serverid).features.add(feature) } } }])
                // } else {
                  // createAlertModal("Error!", "Invalid feature type.");
                // }
              });
            } else {
              powercord.api.notices.sendToast('invalid-guild-id', {
                header: 'Invalid Guild ID', // required
                content: 'The ID you have provided is invalid.',
                image: 'https://cdn.spin.rip/r/errorIcon.png',
                imageClass: 'err-bad-id',
                type: 'error',
                timeout: 10e3
              });
            }
          }}
        >Allows you to add features to a Guild. You can find a list here: <a class="anchor-1MIwyf anchorUnderlineOnHover-2qPutX cta" href="https://discord.com/developers/docs/resources/guild#guild-object-guild-features" rel="noreferrer noopener" target="_blank" role="button" tabindex="0">https://discord.com/developers/docs/resources/guild#guild-object-guild-features</a></TextInput>
      </div>
    );
  }
};