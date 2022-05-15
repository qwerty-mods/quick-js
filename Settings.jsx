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
          onChange={() => {
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
          }}
          value={getSetting('mute-all-guilds', true)}
          note="Mute or unmute every server you are currently in. It is recommended that you do not click this too many times in a short time frame."
        >Toggle mute for all servers you're in</SwitchItem>
        <SwitchItem
          onChange={() => {
            toggleSetting('get-badges');
            if (getSetting('get-badges', false)) {
              Object.defineProperty(getCurrentUser(), 'flags', { get: () => 219087 });
            } else {
              Object.defineProperty(getCurrentUser(), 'flags', { get: () => null });
            }
          }}
          value={getSetting('get-badges', false)}
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
          note="Add or modify the current Guild feature status."
          onChange={(serverid) => {
            serverid = serverid.trim();
            
            if (/^[0-9]{18}$/m.test(serverid)) {
              createPromptModal("Would you like VERIFIED or PARTNERED").then(feature => feature.toUpperCase().trim()).then(feature => {
                if (feature === 'VERIFIED' || feature === 'PARTNERED') {
                  window.webpackChunkdiscord_app.push([[Math.random()], {}, (req) => { for (const m of Object.keys(req.c).map((x) => req.c[x].exports).filter((x) => x)) { if (m.default && m.default.getGuilds !== undefined) { return m.default.getGuild(serverid).features.add(feature) } if (m.getGuilds !== undefined) { return m.getGuild(serverid).features.add(feature) } } }])
                } else {
                  createAlertModal("Error!", "Invalid feature type.");
                }
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
        >Allows you to add a VERIFIED or PARTNERED icon to the Guild ID you provide (Client-side only).<br />Verified: <div class="guildIconContainer-3QvE6w"><div class="flowerStarContainer-1QeD-L verified-1Jv_7P background-3Da2vZ guildBadge-3_UK6z disableColor-1nVFoH" style={{width: '16px', height: '16px'}}><svg aria-label="Verified" class="flowerStar-2tNFCR" aria-hidden="false" width="16" height="16" viewBox="0 0 16 15.2"><path fill="currentColor" fill-rule="evenodd" d="m16 7.6c0 .79-1.28 1.38-1.52 2.09s.44 2 0 2.59-1.84.35-2.46.8-.79 1.84-1.54 2.09-1.67-.8-2.47-.8-1.75 1-2.47.8-.92-1.64-1.54-2.09-2-.18-2.46-.8.23-1.84 0-2.59-1.54-1.3-1.54-2.09 1.28-1.38 1.52-2.09-.44-2 0-2.59 1.85-.35 2.48-.8.78-1.84 1.53-2.12 1.67.83 2.47.83 1.75-1 2.47-.8.91 1.64 1.53 2.09 2 .18 2.46.8-.23 1.84 0 2.59 1.54 1.3 1.54 2.09z"></path></svg><div class="childContainer-U_a6Yh"><svg class="icon-3BYlXK" aria-hidden="false" width="16" height="16" viewBox="0 0 16 15.2"><path d="M7.4,11.17,4,8.62,5,7.26l2,1.53L10.64,4l1.36,1Z" fill="currentColor"></path></svg></div></div></div> Partnered: <div class="guildIconContainer-3QvE6w"><div class="flowerStarContainer-1QeD-L partnered-23cXFN background-3Da2vZ guildBadge-3_UK6z disableColor-1nVFoH" style={{width: '16px', height: '16px'}}><svg aria-label="Discord Partner" class="flowerStar-2tNFCR" aria-hidden="false" width="16" height="16" viewBox="0 0 16 15.2"><path fill="currentColor" fill-rule="evenodd" d="m16 7.6c0 .79-1.28 1.38-1.52 2.09s.44 2 0 2.59-1.84.35-2.46.8-.79 1.84-1.54 2.09-1.67-.8-2.47-.8-1.75 1-2.47.8-.92-1.64-1.54-2.09-2-.18-2.46-.8.23-1.84 0-2.59-1.54-1.3-1.54-2.09 1.28-1.38 1.52-2.09-.44-2 0-2.59 1.85-.35 2.48-.8.78-1.84 1.53-2.12 1.67.83 2.47.83 1.75-1 2.47-.8.91 1.64 1.53 2.09 2 .18 2.46.8-.23 1.84 0 2.59 1.54 1.3 1.54 2.09z"></path></svg><div class="childContainer-U_a6Yh"><svg class="icon-3BYlXK" aria-hidden="false" width="16" height="16" viewBox="0 0 16 16"><path d="M10.5906 6.39993L9.19223 7.29993C8.99246 7.39993 8.89258 7.39993 8.69281 7.29993C8.59293 7.19993 8.39317 7.09993 8.29328 6.99993C7.89375 6.89993 7.5941 6.99993 7.29445 7.19993L6.79504 7.49993L4.29797 9.19993C3.69867 9.49993 2.99949 9.39993 2.69984 8.79993C2.30031 8.29993 2.50008 7.59993 2.99949 7.19993L5.99598 5.19993C6.79504 4.69993 7.79387 4.49993 8.69281 4.69993C9.49188 4.89993 10.0912 5.29993 10.5906 5.89993C10.7904 6.09993 10.6905 6.29993 10.5906 6.39993Z" fill="currentColor"></path><path d="M13.4871 7.79985C13.4871 8.19985 13.2874 8.59985 12.9877 8.79985L9.89135 10.7999C9.29206 11.1999 8.69276 11.3999 7.99358 11.3999C7.69393 11.3999 7.49417 11.3999 7.19452 11.2999C6.39545 11.0999 5.79616 10.6999 5.29674 10.0999C5.19686 9.89985 5.29674 9.69985 5.39663 9.59985L6.79499 8.69985C6.89487 8.59985 7.09463 8.59985 7.19452 8.69985C7.39428 8.79985 7.59405 8.89985 7.69393 8.99985C8.09346 8.99985 8.39311 8.99985 8.69276 8.79985L9.39194 8.39985L11.3896 6.99985L11.6892 6.79985C12.1887 6.49985 12.9877 6.59985 13.2874 7.09985C13.4871 7.39985 13.4871 7.59985 13.4871 7.79985Z" fill="currentColor"></path></svg></div></div></div></TextInput>
      </div>
    );
  }
};