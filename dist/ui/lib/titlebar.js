"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = __importDefault(require("../component"));
const electron_1 = require("electron");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const loader_1 = __importDefault(require("../../loader"));
exports.default = component_1.default({
    template: '#titlebar-template',
    methods: {
        minimize() {
            electron_1.remote.getCurrentWindow().minimize();
        },
        close() {
            electron_1.remote.getCurrentWindow().hide();
        },
        addPlaylist() {
            const self = this;
            electron_1.ipcRenderer.send('openDialog', 0);
            electron_1.ipcRenderer.on('dialogResult', listener);
            function listener(_, res) {
                if (res !== null) {
                    self.$store.state.playlists.push({
                        name: res,
                        tracks: []
                    });
                }
                electron_1.ipcRenderer.removeListener('dialogResult', listener);
            }
        },
        addFiles() {
            electron_1.remote.dialog.showOpenDialog(electron_1.remote.getCurrentWindow(), {
                filters: [
                    { name: 'Music', extensions: ['mp3', 'ogg', 'wav', 'm4a'] }
                ],
                title: 'Add Files',
                properties: ['multiSelections']
            }, files => {
                if (files !== undefined) {
                    const pl = this.$store.state.playlists[this.$store.state.current].tracks;
                    let promises = [];
                    for (const file of files) {
                        let p = loader_1.default(file);
                        promises.push(p);
                        p.then(track => {
                            pl.push({
                                title: track.title,
                                artist: track.artist,
                                album: track.album,
                                duration: track.duration,
                                file
                            });
                        });
                    }
                    Promise.all(promises).then(() => {
                        this.$store.commit("sort");
                    });
                }
            });
        },
        addFolder() {
            electron_1.remote.dialog.showOpenDialog(electron_1.remote.getCurrentWindow(), {
                title: 'Add Folder(s)',
                properties: ['multiSelections', 'openDirectory']
            }, folders => {
                if (folders !== undefined) {
                    const pl = this.$store.state.playlists[this.$store.state.current].tracks;
                    const res = [];
                    let promises = [];
                    exec(folders);
                    for (const file of res) {
                        let p = loader_1.default(file);
                        promises.push(p);
                        p.then(track => {
                            pl.push({
                                title: track.title,
                                artist: track.artist,
                                album: track.album,
                                duration: track.duration,
                                file
                            });
                        });
                    }
                    Promise.all(promises).then(() => {
                        this.$store.commit("sort");
                    });
                    function exec(dirs) {
                        for (const dir of dirs) {
                            if (fs.statSync(dir).isDirectory()) {
                                exec(fs.readdirSync(dir).map(d => path.join(dir, d)));
                            }
                            else if (['.mp3', '.ogg', '.wav', '.m4a'].indexOf(path.extname(dir)) >= 0) {
                                res.push(dir);
                            }
                        }
                    }
                }
            });
        }
    }
});
