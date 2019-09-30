"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const url = __importStar(require("url"));
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
electron_1.app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
let win = null;
let win2 = null;
let dialog = null;
const locked = electron_1.app.requestSingleInstanceLock();
if (!locked) {
    electron_1.app.quit();
}
else {
    electron_1.app.on('second-instance', (_event, commandLine, _workingDirectory) => {
        if (win !== null) {
            if (win.isMinimized())
                win.restore();
            openLib(true);
            win2.webContents.send("openFile", commandLine[commandLine.length - 1]);
            win.focus();
        }
    });
}
electron_1.ipcMain.on("getFile", (e) => {
    let data = null;
    if (!electron_is_dev_1.default) {
        data = process.argv[1];
    }
    else {
        data = process.argv[2];
    }
    e.returnValue = data;
});
electron_1.ipcMain.on("openFile", (_, file) => {
    openLib(true);
    win2.webContents.send("openFile", file);
});
electron_1.ipcMain.on('openLib', () => {
    openLib();
});
electron_1.ipcMain.on('setQueue', (_, val) => {
    if (win !== null)
        win.webContents.send('setQueue', val);
});
electron_1.ipcMain.on('playTrack', (_, val) => {
    if (win !== null)
        win.webContents.send('playTrack', val);
});
electron_1.ipcMain.on('setCurrentTrack', (_, val) => {
    if (win2 !== null)
        win2.webContents.send('setCurrentTrack', val);
});
electron_1.ipcMain.on('openDialog', (_, i, ...args) => {
    openDialog();
    if (i == 0)
        dialog.on("ready-to-show", () => dialog.webContents.executeJavaScript('addPlaylist();'));
    else if (i == 1)
        dialog.on("ready-to-show", () => dialog.webContents.executeJavaScript(`renamePlaylist("${args[0]}");`));
});
electron_1.ipcMain.on('dialogResult', (_, res) => win2.webContents.send('dialogResult', res));
function openLib(hidden = false) {
    if (win2 !== null) {
        win2.focus();
        // if (!hidden) win2.show();
    }
    else {
        win2 = new electron_1.BrowserWindow({
            width: 400,
            height: 600,
            // show: !hidden,
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
function openPlayer() {
    if (win !== null)
        win.focus();
    else {
        win = new electron_1.BrowserWindow({
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
function openDialog() {
    if (dialog !== null)
        dialog.focus();
    else {
        dialog = new electron_1.BrowserWindow({
            width: 200,
            height: 90,
            resizable: false,
            maximizable: false,
            frame: false,
            parent: win2,
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
        dialog.on('ready-to-show', () => dialog.show());
        dialog.on('closed', () => dialog = null);
    }
}
electron_1.app.on('ready', () => {
    openPlayer();
    openLib(true);
});
electron_1.app.on('window-all-closed', () => { if (process.platform !== 'darwin')
    electron_1.app.quit(); });
electron_1.app.on('activate', () => { if (win === null) {
    openPlayer();
} });
