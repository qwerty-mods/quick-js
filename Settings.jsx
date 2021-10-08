const { React } = require('powercord/webpack');
const webpack = require('powercord/webpack');
const { SwitchItem, TextInput } = require('powercord/components/settings')

module.exports = class Settings extends React.PureComponent {
    constructor(props) {
        super(props);
        
        this._setState(false);
    }

    _setState(update) {
        const state = {
            isIdleValid: Number(this.props.getSetting('idle-duration', 60000)),
            initialIdleValue: this.props.getSetting('idle-duration', 60000),
            idleValue: this.props.getSetting('idle-duration')
        };

        if (update) {
            this.setState(state);
        } else {
            this.state = state;
        }
    }

    render() {
        const { getSetting, toggleSetting, updateSetting } = this.props;
        return (
            <div>
                <SwitchItem
                    onChange={(e) => toggleSetting('1s-sm')}
                    value={getSetting('1s-sm', true)}
                    note="Adds a 1s option to the slowmode slider."
                >1s Slowmode Setting</SwitchItem>
                <SwitchItem
                    onChange={(e) => toggleSetting('quick-house')}
                    value={getSetting('quick-house', true)}
                    note="A command that allows you to switch houses easily."
                >Quick House Changer</SwitchItem>
                <SwitchItem
                    onChange={(e) => toggleSetting('load-missing')}
                    value={getSetting('load-missing', true)}
                    note="A command that allows you to load any missing plugins/themes."
                >Load Missing Plugins/Themes</SwitchItem>
                <TextInput
                    value={this.state.isIdleValid ? getSetting("idle-duration") : this.state.idleValue}
                    note="Choose the amount of time in seconds before discord automatically turns you IDLE. Default is 60000."
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
            </div>
        )
    }
}
