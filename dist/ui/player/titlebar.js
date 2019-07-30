"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = __importDefault(require("../component"));
const electron_1 = require("electron");
exports.default = component_1.default({
    template: '#titlebar-template',
    data() {
        const volume = parseInt(localStorage.getItem('volume') || '50');
        const muted = eval(localStorage.getItem('muted') || 'false');
        const repeat = eval(localStorage.getItem('repeat') || 'false');
        this.$store.state.audio.volume = (100 - volume) / 100;
        this.$store.state.audio.muted = muted;
        this.$store.state.audio.loop = repeat;
        return {
            volume,
            muted,
            repeat,
        };
    },
    computed: {
        volume_icon() {
            const vol = 100 - this.volume;
            return this.muted ? 'fa-volume-mute' :
                vol >= 50 ? 'fa-volume-up' :
                    vol === 0 ? 'fa-volume-off' : 'fa-volume-down';
        }
    },
    watch: {
        volume() {
            this.$store.state.audio.volume = (100 - this.volume) / 100;
        },
        muted() {
            this.$store.state.audio.muted = this.muted;
        },
        repeat() {
            this.$store.state.audio.loop = this.repeat;
        }
    },
    methods: {
        minimize() {
            electron_1.remote.getCurrentWindow().minimize();
        },
        close() {
            this.$store.state.playing = false;
            electron_1.remote.getCurrentWindow().close();
        },
        openLib() {
            electron_1.ipcRenderer.send('openLib');
        }
    },
    created() {
        electron_1.remote.globalShortcut.register("VolumeUp", () => {
            if (this.volume > 1)
                this.volume -= 2;
        });
        electron_1.remote.globalShortcut.register("VolumeDown", () => {
            if (this.volume < 99)
                this.volume += 2;
        });
        electron_1.remote.globalShortcut.register("VolumeMute", () => {
            this.muted = !this.muted;
        });
        window.addEventListener('beforeunload', () => {
            localStorage.setItem('volume', `${this.volume}`);
            localStorage.setItem('muted', this.muted ? 'true' : 'false');
            localStorage.setItem('repeat', this.repeat ? 'true' : 'false');
            localStorage.setItem('shuffle', this.$store.state.shuffle ? 'true' : 'false');
            localStorage.setItem('queue', JSON.stringify(this.$store.state.queue));
            localStorage.setItem('current', `${this.$store.state.current}`);
        });
    }
});
