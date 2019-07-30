"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = __importDefault(require("../component"));
const electron_1 = require("electron");
const { Menu, MenuItem, getCurrentWindow } = electron_1.remote;
exports.default = component_1.default({
    template: '#playlists-template',
    computed: {
        playlists() {
            return this.$store.state.playlists;
        }
    },
    methods: {
        contextmenu(i, e) {
            const self = this;
            const menu = new Menu();
            menu.append(new MenuItem({
                label: "Rename",
                click() {
                    electron_1.ipcRenderer.send('openDialog', 1, self.$store.state.playlists[i].name);
                    electron_1.ipcRenderer.on('dialogResult', listener);
                    function listener(_, res) {
                        if (res !== null) {
                            self.$store.state.playlists[i].name = res;
                        }
                        electron_1.ipcRenderer.removeListener('dialogResult', listener);
                    }
                }
            }));
            menu.append(new MenuItem({
                label: "Remove",
                click() {
                    self.playlists.splice(i, 1);
                }
            }));
            menu.popup({
                x: e.clientX,
                y: e.clientY,
                window: getCurrentWindow()
            });
        }
    }
});
