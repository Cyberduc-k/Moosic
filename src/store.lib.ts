import Vuex from "vuex";

export interface Playlist
{
    name: string;
    tracks: { title: string, artist: string, album: string, duration: number, file: string }[];
}

export default new Vuex.Store({
    state: {
        current: -1,
		currentTrack: -1,
        playlists: <Playlist[]>JSON.parse(localStorage.getItem('playlists') || '[{ "name": "default", "tracks": [] }]')
    },
    mutations: {
        sort(state) {
            let pl = state.playlists[state.current];
            
            pl.tracks.sort((a, b) => a.file.localeCompare(b.file));
        }
    }
});
