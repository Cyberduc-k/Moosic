import Component from "../component";
import song from "./track";
import { Playlist } from "../../store.lib";
import { ipcRenderer } from "electron";

export default Component({
    template: '#playlist-template',
    computed: {
        pl(): Playlist
        {
            return this.$store.state.playlists[this.$store.state.current];
        }
	},
	methods: {
		playTrack(i: number): void
		{
			const tracks = this.$store.state.playlists[this.$store.state.current].tracks.map((t: Playlist["tracks"][0]) => t.file);

			ipcRenderer.send('setQueue', tracks);
			ipcRenderer.send('playTrack', i);

			this.$store.state.qurrentTrack = i;
		}
	},
    components: {
        song
    }
});
