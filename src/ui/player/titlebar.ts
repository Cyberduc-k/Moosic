import Component from "../component";
import { remote, ipcRenderer } from "electron";

export default Component({
    template: '#titlebar-template',
    data()
    {
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
            alwaysOnTop: false
        };
    },
    computed: {
        volume_icon(): string
        {
            const vol = 100 - this.volume;

            return this.muted ? 'fa-volume-mute' :
                vol >= 50 ? 'fa-volume-up' :
                    vol === 0 ? 'fa-volume-off' : 'fa-volume-down';
        }
    },
    watch: {
        volume()
        {
            this.$store.state.audio.volume = (100 - this.volume) / 100;
        },
        muted()
        {
            this.$store.state.audio.muted = this.muted;
        },
        repeat()
        {
            this.$store.state.audio.loop = this.repeat;
        }
    },
    methods: {
        minimize()
        {
            remote.getCurrentWindow().minimize();
        },
        close()
        {
            this.$store.state.playing = false;
            remote.getCurrentWindow().close();
        },
        openLib()
        {
            ipcRenderer.send('openLib');
        },
        toggleAlwaysOnTop()
        {
            const win = remote.getCurrentWindow();
            
            if (this.alwaysOnTop) {
                win.setAlwaysOnTop(false);
                this.alwaysOnTop = false;
            } else {
                win.setAlwaysOnTop(true);
                this.alwaysOnTop = true;
            }
        }
    },
    created()
    {
        remote.globalShortcut.register("VolumeUp", () =>
        {
            if (this.volume > 1)
                this.volume -= 2;
        });

        remote.globalShortcut.register("VolumeDown", () =>
        {
            if (this.volume < 99)
                this.volume += 2;
        });

        remote.globalShortcut.register("VolumeMute", () =>
        {
            this.muted = !this.muted;
        });

        window.addEventListener('beforeunload', () =>
        {
            localStorage.setItem('volume', `${this.volume}`);
            localStorage.setItem('muted', this.muted ? 'true' : 'false');
            localStorage.setItem('repeat', this.repeat ? 'true' : 'false');
            localStorage.setItem('shuffle', this.$store.state.shuffle ? 'true' : 'false');
            localStorage.setItem('queue', JSON.stringify(this.$store.state.queue));
            localStorage.setItem('current', `${this.$store.state.current}`);
        });
    }
});