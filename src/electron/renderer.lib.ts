import Vue from "vue";
import Vuex from "vuex";
// @ts-ignore
import VueAsyncComputed from "vue-async-computed";

Vue.use(Vuex);
Vue.use(VueAsyncComputed, { errorHandler: false });

import store, { Playlist } from "../store.lib";
import { titlebar, playlist, playlists } from "../ui/lib";
import { ipcRenderer, remote } from "electron";
import * as fs from "fs";
import load from "../loader";

new Vue({
    el: '#app',
    template: '#app-template',
    store,
    computed: {
        current(): number
        {
            return this.$store.state.current;
        }
    },
	created()
	{
		ipcRenderer.on('setCurrentTrack', (_: any, val: number) => {
			this.$store.state.currentTrack = val;
        });
        
        ipcRenderer.on("openFile", async (_: any, file: string) => {
            const pl = this.$store.state.playlists[0];
            const stats = fs.statSync(file);
            
            pl.tracks = [];
            
            if (stats.isDirectory()) {
                for (const f of fs.readdirSync(file)) {
                    if (/\.(mp3|m4a|ogg|wav)$/.test(f)) {
                        const track = await load(f);
                        
                        pl.tracks.push({
                            title: track.title,
                            artist: track.artist,
                            album: track.album,
                            duration: track.duration,
                            file: f
                        });
                    }
                }
            } else {
                if (/\.(mp3|m4a|ogg|wav)$/.test(file)) {
                    const track = await load(file);
                    
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
            
            const tracks = pl.tracks.map((t: Playlist["tracks"][0]) => t.file);
            
            ipcRenderer.send('setQueue', tracks);
            
            if (pl.tracks.length > 0) {
                ipcRenderer.send('playTrack', 0);

                this.$store.state.qurrentTrack = 0;
            }
            
            remote.getCurrentWindow().close();
        });

		window.addEventListener('beforeunload', () =>
		{
			localStorage.setItem('playlists', JSON.stringify(this.$store.state.playlists));
		});
	},
    components: {
        titlebar,
        playlists,
        playlist
    }
});
