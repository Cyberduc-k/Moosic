import Vue from "vue";
import Vuex from "vuex";
// @ts-ignore
import VueAsyncComputed from "vue-async-computed";

Vue.use(Vuex);
Vue.use(VueAsyncComputed, { errorHandler: false });

import store from "../store";
import { titlebar, player, controls } from "../ui/player";
import { remote, ipcRenderer } from "electron";
import load from "../loader";

new Vue({
    el: '#app',
    store,
    template: '#app-template',
    watch: {
        '$store.state.playing'()
        {
            const playing: boolean = this.$store.state.playing;
            const win = remote.getCurrentWindow();
            const size = win.getSize();
            
            if (playing)
                win.setSize(size[0], size[1] + 80);
            else
                setTimeout(() =>
                {
                    win.setResizable(true);
                    win.setSize(size[0], size[1] - 80);
                    win.setResizable(false);
                }, 300);
        }
    },
	created()
	{
        const file = ipcRenderer.sendSync("getFile");
        
        if (file !== null) {
            ipcRenderer.send("openFile", file);
        }
        
        if (this.$store.state.track === null && this.$store.state.current >= 0) {
            this.$store.state.audio.src = this.$store.state.queue[this.$store.state.current];
        
            load(this.$store.state.queue[this.$store.state.current]).then(track => this.$store.state.track = track);
        }
        
        window.addEventListener("keypress", e => {
            if (e.code === "Space") {
                e.preventDefault();
                e.stopPropagation();
                
                if (this.$store.state.playing) {
                    this.$store.state.playing = false;
                    this.$store.state.audio.pause();
                }
                else if (this.$store.state.track !== null) {
                    this.$store.state.playing = true;
                    this.$store.state.audio.play();
                }
            }
        });
        
        window.addEventListener("wheel", e => {
            if (this.$store.state.track !== null) {
                if (e.deltaY > 0) {
                    this.$store.state.audio.currentTime += 10;
                } else {
                    this.$store.state.audio.currentTime -= 10;
                }
            }
        });
        
        window.addEventListener("beforeunload", () => {
            remote.globalShortcut.unregisterAll();
            this.$store.state.playing = false;
        });
        
        remote.globalShortcut.register("MediaPlayPause", () => {
            if (this.$store.state.playing) {
                this.$store.state.playing = false;
                this.$store.state.audio.pause();
            }
            else if (this.$store.state.track !== null) {
                this.$store.state.playing = true;
                this.$store.state.audio.play();
            }
        });
        
        remote.globalShortcut.register("MediaNextTrack", () => {
            this.$store.commit("next");
        });
        
        remote.globalShortcut.register("MediaPreviousTrack", () => {
            this.$store.commit("prev");
        });
        
		ipcRenderer.on('setQueue', (_: any, val: string[]) =>
		{
            this.$store.state.queue.splice(0, Infinity, ...val);
		});

		ipcRenderer.on('playTrack', (_: any, val: number) =>
		{
			window.focus();
			document.body.click();
            this.$store.state.playing = true;
            this.$store.state.audio.src = this.$store.state.queue[val];
            
            load(this.$store.state.queue[val]).then(track => this.$store.state.track = track);

			if (this.$store.state.current === val) {
                this.$store.state.audio.currentTime = 0;
                this.$store.state.audio.play();
            }

            this.$store.state.current = val;
        });
    },
    components: {
        titlebar,
        player,
        controls
    }
});