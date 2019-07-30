import Component from "../component";
import { remote, ipcRenderer } from "electron";

export default Component({
    template: '#titlebar-template',
    data() {
        return {
            globals: require("./globals")
        }
    },
	methods: {
		minimize()
		{
			remote.getCurrentWindow().minimize();
		},
		close()
		{
			ipcRenderer.send('dialogResult', null);
			remote.getCurrentWindow().close();
		}
	}
});
