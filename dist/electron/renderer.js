"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_1 = __importDefault(require("vue"));
const vuex_1 = __importDefault(require("vuex"));
// @ts-ignore
const vue_async_computed_1 = __importDefault(require("vue-async-computed"));
vue_1.default.use(vuex_1.default);
vue_1.default.use(vue_async_computed_1.default, { errorHandler: false });
const store_1 = __importDefault(require("../store"));
const player_1 = require("../ui/player");
const electron_1 = require("electron");
const loader_1 = __importDefault(require("../loader"));
new vue_1.default({
    el: '#app',
    store: store_1.default,
    template: '#app-template',
    watch: {
        '$store.state.playing'() {
            const playing = this.$store.state.playing;
            const win = electron_1.remote.getCurrentWindow();
            const size = win.getSize();
            if (playing)
                win.setSize(size[0], size[1] + 80);
            else
                setTimeout(() => {
                    win.setResizable(true);
                    win.setSize(size[0], size[1] - 80);
                    win.setResizable(false);
                }, 300);
        }
    },
    created() {
        const file = electron_1.ipcRenderer.sendSync("getFile");
        if (file !== null) {
            electron_1.ipcRenderer.send("openFile", file);
        }
        if (this.$store.state.track === null && this.$store.state.current >= 0) {
            this.$store.state.audio.src = this.$store.state.queue[this.$store.state.current];
            loader_1.default(this.$store.state.queue[this.$store.state.current]).then(track => this.$store.state.track = track);
        }
        window.addEventListener("keypress", e => {
            if (e.code === "Space") {
                e.preventDefault();
                e.stopPropagation();
                if (this.$store.state.playing) {
                    this.$store.state.playing = false;
                    this.$store.state.audio.pause();
                }
                else if (this.$store.state.track !== null) {
                    this.$store.state.playing = true;
                    this.$store.state.audio.play();
                }
            }
        });
        window.addEventListener("wheel", e => {
            if (this.$store.state.track !== null) {
                if (e.deltaY > 0) {
                    this.$store.state.audio.currentTime += 10;
                }
                else {
                    this.$store.state.audio.currentTime -= 10;
                }
            }
        });
        window.addEventListener("beforeunload", () => {
            electron_1.remote.globalShortcut.unregisterAll();
            this.$store.state.playing = false;
        });
        electron_1.remote.globalShortcut.register("MediaPlayPause", () => {
            if (this.$store.state.playing) {
                this.$store.state.playing = false;
                this.$store.state.audio.pause();
            }
            else if (this.$store.state.track !== null) {
                this.$store.state.playing = true;
                this.$store.state.audio.play();
            }
        });
        electron_1.remote.globalShortcut.register("MediaNextTrack", () => {
            this.$store.commit("next");
        });
        electron_1.remote.globalShortcut.register("MediaPreviousTrack", () => {
            this.$store.commit("prev");
        });
        electron_1.ipcRenderer.on('setQueue', (_, val) => {
            this.$store.state.queue.splice(0, Infinity, ...val);
        });
        electron_1.ipcRenderer.on('playTrack', (_, val) => {
            window.focus();
            document.body.click();
            this.$store.state.playing = true;
            this.$store.state.audio.src = this.$store.state.queue[val];
            loader_1.default(this.$store.state.queue[val]).then(track => this.$store.state.track = track);
            if (this.$store.state.current === val) {
                this.$store.state.audio.currentTime = 0;
                this.$store.state.audio.play();
            }
            this.$store.state.current = val;
        });
    },
    components: {
        titlebar: player_1.titlebar,
        player: player_1.player,
        controls: player_1.controls
    }
});
