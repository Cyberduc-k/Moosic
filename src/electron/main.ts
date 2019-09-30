import { app, BrowserWindow, ipcMain, Event } from 'electron';
import * as path from 'path';
import * as url from 'url';
import isDev from "electron-is-dev";

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

let win: BrowserWindow | null = null;
let win2: BrowserWindow | null = null;
let dialog: BrowserWindow | null = null;

const locked = app.requestSingleInstanceLock();

if (!locked) {
    app.quit();
} else {
    app.on('second-instance', (_event, commandLine, _workingDirectory) => {
        if (win !== null) {
            if (win.isMinimized()) win.restore();
            
            openLib(true);
            
            win2!.webContents.send("openFile", commandLine[commandLine.length - 1]);
            
            win.focus();
        }
    })
}

ipcMain.on("getFile", (e: Event) => {
    let data = null;
    
    if (!isDev) {
        data = process.argv[1];
    } else {
        data = process.argv[2];
    }
    
    e.returnValue = data;
});

ipcMain.on("openFile", (_: any, file: string) => {
    openLib(true);
    
    win2!.webContents.send("openFile", file);
});

ipcMain.on('openLib', () =>
{
    openLib();
});

ipcMain.on('setQueue', (_: any, val: string[]) =>
{
	if (win !== null)
		win.webContents.send('setQueue', val);
});

ipcMain.on('playTrack', (_: any, val: number) =>
{
	if (win !== null)
		win.webContents.send('playTrack', val);
});

ipcMain.on('setCurrentTrack', (_: any, val: number) =>
{
	if (win2 !== null)
		win2.webContents.send('setCurrentTrack', val);
});

ipcMain.on('openDialog', (_: any, i: number, ...args: any[]) =>
{
    openDialog();
    
    if (i == 0)
        dialog!.on("ready-to-show", () => dialog!.webContents.executeJavaScript('addPlaylist();'));
    else if (i == 1)
        dialog!.on("ready-to-show", () => dialog!.webContents.executeJavaScript(`renamePlaylist("${args[0]}");`))
});

ipcMain.on('dialogResult', (_: any, res: string | null) => win2!.webContents.send('dialogResult', res));

function openLib(hidden = false)
{
    if (win2 !== null) {
        win2.focus();
        
        if (!hidden) win2.show();
    }
    else
    {
        win2 = new BrowserWindow({
            width: 400,
            height: 600,
            show: !hidden,
            frame: false,
            webPreferences: {
                nodeIntegration: true
            }
        });

        win2.loadURL(url.format({
            pathname: path.resolve(__dirname, '..', 'lib.html'),
            protocol: 'file:',
            slashes: true
        }));

        win2.on('closed', () => win2 = null);
    }
}

function openPlayer()
{
    if (win !== null)
        win.focus();
    else
    {
        win = new BrowserWindow({
            width: 450,
            height: 146,
            resizable: false,
            maximizable: false,
            frame: false,
            transparent: true,
            hasShadow: true,
            backgroundColor: "#00FFFFFF",
            webPreferences: {
                experimentalFeatures: true,
                nodeIntegration: true
            }
        });

        win.loadURL(url.format({
            pathname: path.resolve(__dirname, '..', 'index.html'),
            protocol: 'file:',
            slashes: true
        }));

        win.on('closed', () => {
			if (dialog !== null)
				dialog.close();

			if (win2 !== null)
				win2.close();

			win = null;
		});
    }
}

function openDialog()
{
	if (dialog !== null)
		dialog.focus();
	else
	{
		dialog = new BrowserWindow({
			width: 200,
			height: 90,
			resizable: false,
			maximizable: false,
			frame: false,
			parent: win2!,
			modal: true,
            show: false,
            webPreferences: {
                nodeIntegration: true
            }
		});

		dialog.loadURL(url.format({
			pathname: path.resolve(__dirname, '..', 'dialog.html'),
			protocol: 'file:',
			slashes: true
		}));

		dialog.on('ready-to-show', () => dialog!.show());
		dialog.on('closed', () => dialog = null);
	}
}

app.on('ready', () => {
    openPlayer();
    openLib(true);
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

app.on('activate', () => { if (win === null) { openPlayer(); } });
