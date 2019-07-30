import Component from "../component";
import { Playlist } from "../../store.lib";
import { remote, ipcRenderer } from "electron";
const { Menu, MenuItem, getCurrentWindow } = remote;

export default Component({
    template: '#playlists-template',
    computed: {
        playlists(): Playlist[]
        {
            return this.$store.state.playlists;
        }
    },
    methods: {
        contextmenu(i: number, e: MouseEvent) {
            const self = this;
            const menu = new Menu();
        
            menu.append(new MenuItem({
                label: "Rename",
                click() {
                    ipcRenderer.send('openDialog', 1, self.$store.state.playlists[i].name);
                    ipcRenderer.on('dialogResult', listener);
    
                    function listener(_: any, res: string | null): void
                    {
                        if (res !== null)
                        {
                            self.$store.state.playlists[i].name = res;
                        }
                        
                        ipcRenderer.removeListener('dialogResult', listener);
                    }
                }
            }));
            
            menu.append(new MenuItem({
                label: "Remove",
                click() {
                    self.playlists.splice(i, 1);
                }
            }));
            
            menu.popup({
                x: e.clientX,
                y: e.clientY,
                window: getCurrentWindow()
            });
        }
    }
});