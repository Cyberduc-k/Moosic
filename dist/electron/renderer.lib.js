"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const vue_1 = __importDefault(require("vue"));
const vuex_1 = __importDefault(require("vuex"));
// @ts-ignore
const vue_async_computed_1 = __importDefault(require("vue-async-computed"));
const vue_draggable_1 = __importDefault(require("vue-draggable"));
vue_1.default.use(vuex_1.default);
vue_1.default.use(vue_async_computed_1.default, { errorHandler: false });
vue_1.default.use(vue_draggable_1.default);
const store_lib_1 = __importDefault(require("../store.lib"));
const lib_1 = require("../ui/lib");
const electron_1 = require("electron");
const fs = __importStar(require("fs"));
const loader_1 = __importDefault(require("../loader"));
new vue_1.default({
    el: '#app',
    template: '#app-template',
    store: store_lib_1.default,
    computed: {
        current() {
            return this.$store.state.current;
        }
    },
    created() {
        electron_1.ipcRenderer.on('setCurrentTrack', (_, val) => {
            this.$store.state.currentTrack = val;
        });
        electron_1.ipcRenderer.on("openFile", (_, file) => __awaiter(this, void 0, void 0, function* () {
            const pl = this.$store.state.playlists[0];
            const stats = fs.statSync(file);
            pl.tracks = [];
            if (stats.isDirectory()) {
                for (const f of fs.readdirSync(file)) {
                    if (/\.(mp3|m4a|ogg|wav)$/.test(f)) {
                        const track = yield loader_1.default(f);
                        pl.tracks.push({
                            title: track.title,
                            artist: track.artist,
                            album: track.album,
                            duration: track.duration,
                            file: f
                        });
                    }
                }
            }
            else {
                if (/\.(mp3|m4a|ogg|wav)$/.test(file)) {
                    const track = yield loader_1.default(file);
                    pl.tracks = [{
                            title: track.title,
                            artist: track.artist,
                            album: track.album,
                            duration: track.duration,
                            file
                        }];
                }
            }
            this.$store.state.current = 0;
            const tracks = pl.tracks.map((t) => t.file);
            electron_1.ipcRenderer.send('setQueue', tracks);
            if (pl.tracks.length > 0) {
                electron_1.ipcRenderer.send('playTrack', 0);
                this.$store.state.qurrentTrack = 0;
            }
        }));
        window.addEventListener('beforeunload', () => {
            localStorage.setItem('playlists', JSON.stringify(this.$store.state.playlists));
        });
    },
    components: {
        titlebar: lib_1.titlebar,
        playlists: lib_1.playlists,
        playlist: lib_1.playlist
    }
});
