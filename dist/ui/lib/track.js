"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = __importDefault(require("../component"));
const electron_1 = __importDefault(require("electron"));
const { Menu, MenuItem } = electron_1.default.remote;
exports.default = component_1.default({
    template: '#track-template',
    name: 'song',
    props: ['track', 'index'],
    computed: {
        mins() {
            return Math.floor((~~this.track.duration) / 60);
        },
        secs() {
            if ((~~this.track.duration) % 60 < 10)
                return `${(~~this.track.duration) % 60}0`;
            else
                return (~~this.track.duration) % 60;
        }
    },
    mounted() {
        const menu = new Menu();
        menu.append(new MenuItem({
            label: "Remove",
            click: () => {
                const current = this.$store.state.current;
                const playlist = this.$store.state.playlists[current];
                playlist.tracks.splice(this.index, 1);
            }
        }));
        this.$el.addEventListener("contextmenu", e => {
            const x = e.clientX;
            const y = e.clientY;
            menu.popup({
                x,
                y,
                window: electron_1.default.remote.getCurrentWindow()
            });
        });
    }
});
