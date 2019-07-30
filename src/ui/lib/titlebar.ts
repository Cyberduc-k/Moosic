import Component from "../component";
import { remote, ipcRenderer } from "electron";
import * as fs from "fs";
import * as path from "path";
import load from "../../loader";

export default Component({
    template: '#titlebar-template',
    methods: {
        minimize()
        {
            remote.getCurrentWindow().minimize();
        },
        close()
        {
			remote.getCurrentWindow().close();
        },
		addPlaylist()
		{
			const self = this;

			ipcRenderer.send('openDialog', 0);
			ipcRenderer.on('dialogResult', listener);

			function listener(_: any, res: string | null): void
			{
				if (res !== null)
				{
					self.$store.state.playlists.push({
						name: res,
						tracks: []
					});
				}

				ipcRenderer.removeListener('dialogResult', listener);
			}
		},
		addFiles()
		{
			remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
				filters: [
					{ name: 'Music', extensions: ['mp3', 'ogg', 'wav', 'm4a'] }
				],
				title: 'Add Files',
				properties: ['multiSelections']
			}, files => {
				if (files !== undefined) {
					const pl = this.$store.state.playlists[this.$store.state.current].tracks;

					for (const file of files) {
						load(file).then(track => {
							pl.push({
								title: track.title,
								artist: track.artist,
								album: track.album,
								duration: track.duration,
								file
							});
						});
					}	
				}
			});
		},
		addFolder()
		{
			remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
				title: 'Add Folder(s)',
				properties: ['multiSelections', 'openDirectory']
			}, folders => {
				if (folders !== undefined) {
					const pl = this.$store.state.playlists[this.$store.state.current].tracks;
					const res: string[] = [];

					exec(folders);

					for (const file of res) {
						load(file).then(track => {
							pl.push({
								title: track.title,
								artist: track.artist,
								album: track.album,
								duration: track.duration,
								file
							});
						});
					}

					function exec(dirs: string[]) {
						for (const dir of dirs) {
							if (fs.statSync(dir).isDirectory()) {
								exec(fs.readdirSync(dir).map(d => path.join(dir, d)));
							} else if (['.mp3', '.ogg', '.wav', '.m4a'].indexOf(path.extname(dir)) >= 0) {
								res.push(dir);
							}
						}
					}
				}
			});
		}
    }
});
