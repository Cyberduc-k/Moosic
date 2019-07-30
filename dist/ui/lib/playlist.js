"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = __importDefault(require("../component"));
const track_1 = __importDefault(require("./track"));
const electron_1 = require("electron");
exports.default = component_1.default({
    template: '#playlist-template',
    computed: {
        pl() {
            return this.$store.state.playlists[this.$store.state.current];
        }
    },
    methods: {
        playTrack(i) {
            const tracks = this.$store.state.playlists[this.$store.state.current].tracks.map((t) => t.file);
            electron_1.ipcRenderer.send('setQueue', tracks);
            electron_1.ipcRenderer.send('playTrack', i);
            this.$store.state.qurrentTrack = i;
        }
    },
    components: {
        song: track_1.default
    }
});
