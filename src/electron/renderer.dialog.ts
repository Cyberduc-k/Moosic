import Vue from "vue";
import { titlebar } from "../ui/dialog";
import { remote, ipcRenderer } from "electron";

new Vue({
	el: '#app',
	template: '#app-template',
	data: {
        globals: require("../ui/dialog/globals"),
	},
	methods: {
		cancel()
		{
			ipcRenderer.send('dialogResult', null);
			remote.getCurrentWindow().close();
		},
		done()
		{
			ipcRenderer.send('dialogResult', this.globals.text.length > 0 ? this.globals.text : null);
			remote.getCurrentWindow().close();
		}
	},
	components: {
		titlebar
	}
});
