const { React, getModule } = require('powercord/webpack');
const webpack = require('powercord/webpack');
const { SwitchItem, TextInput } = require('powercord/components/settings')

const { BOT_AVATARS } = getModule(["BOT_AVATARS"], false);

const isValidUrl = function isValidUrl(string) {
    let url;
    try {url = new URL(string)} catch (_) {return false}
    return url.protocol === "http:" || url.protocol === "https:";
}

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
                    onChange={(e) => {
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
                    onChange={(e) => {
                        toggleSetting('quick-house');
                        if (getSetting('quick-house', true)) {
                            HouseCMD.register()
                        } else {
                            HouseCMD.unregister()
                        }
                    }}
                    value={getSetting('quick-house', true)}
                    note="A command that allows you to switch houses easily."
                >Quick House Changer</SwitchItem>
                <SwitchItem
                    onChange={(e) => {
                        toggleSetting('load-missing');
                        if (getSetting('load-missing', true)) {
                            LoadCMD.register()
                        } else {
                            LoadCMD.unregister()
                        }
                    }}
                    value={getSetting('load-missing', true)}
                    note="A command that allows you to load any missing plugins/themes."
                >Load Missing Plugins/Themes</SwitchItem>
                <TextInput
                    value={this.state.isIdleValid ? getSetting("idle-duration") : this.state.idleValue}
                    note="Choose the amount of time in MILLISECONDS before discord automatically turns you IDLE. Default is 600000."
                    style={!this.state.isIdleValid ? { borderColor: 'red' } : {}}
                    onChange={(value) => {
                        if (Number(value)) {
                            this.setState({ isIdleValid: true });
                            updateSetting('idle-duration', value);
                            webpack.constants.IDLE_DURATION = parseInt(value);
                        } else {
                            this.setState({ isIdleValid: false, idleValue: value });
                            updateSetting('idle-duration', this.state.initialIdleValue);
                        }
                    } }
                >Auto-IDLE Time</TextInput>
                <TextInput
                    value={this.state.clydeImg ? getSetting("clyde-pfp", BOT_AVATARS.oldPowercord) : this.state.clydeImg}
                    note="Change the pfp of Clyde. Make sure that eradicating Clyde is enabled in settings. Default is https://tinyurl.com/powercord-clyde"
                    style={!this.state.clydeImgValid ? { borderColor: 'red' } : {}}
                    onChange={(value) => {
                        if (isValidUrl(value)) {
                            this.setState({ clydeImgValid: true });
                            updateSetting('clyde-pfp', value);
                            BOT_AVATARS.powercord = value
                        } else {
                            this.setState({ clydeImgValid: false, clydeImg: value });
                            updateSetting('clyde-pfp', this.state.initialclydeImg);
                        }
                    } }
                >Force Change Clyde PFP</TextInput>
            </div>
        )
    }
}
