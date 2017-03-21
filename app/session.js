import { dialog, ipcMain } from 'electron';
import fs from 'fs';

const sessionFilters = [{ name: 'Session', extensions: ['json']}];
let mainWindow = null;

function requestData(fileName) {
    mainWindow.webContents.send('session-filename');
    ipcMain.once('session-data', (event, data) => {
        saveData(fileName, data);
    });
}

function saveData(fileName, data) {
    fs.writeFile(fileName, data, 'utf-8', (err) => {
        if(err) return console.error(err);
        console.log('session data saved to ' + fileName);
    });
}

function save() {
    dialog.showSaveDialog({
        title: 'Save session',
        defaultPath: 'session.json',
        filters: sessionFilters
    }, (fileName) => {
        if(!fileName || !fileName.length) return;
        requestData(fileName);
    });
}

function loadData(fileName) {
    fs.readFile(fileName[0], (err, data) => {
        if(err) return console.error(err);
        mainWindow.webContents.send('session-loaded', data); 
    });
}

function load() {
    dialog.showOpenDialog({
        title: 'Open session',
        filters: sessionFilters
    }, (fileName) => {
        if(!fileName || !fileName.length) return;
        loadData(fileName);
    });
}

function setMainWindow(win) {
    mainWindow = win;
}

export default {
    save,
    load,
    setMainWindow
};