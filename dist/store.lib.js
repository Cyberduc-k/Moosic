"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vuex_1 = __importDefault(require("vuex"));
exports.default = new vuex_1.default.Store({
    state: {
        current: -1,
        currentTrack: -1,
        playlists: JSON.parse(localStorage.getItem('playlists') || '[{ "name": "default", "tracks": [] }]')
    },
    mutations: {
        sort(state) {
            let pl = state.playlists[state.current];
            pl.tracks.sort((a, b) => a.file.localeCompare(b.file));
        }
    }
});
