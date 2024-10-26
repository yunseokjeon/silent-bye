import { app, BrowserWindow, Tray, Menu } from 'electron';
import path from 'path';

let tray = null;
let mainWindow = null;

app.on('ready', () => {
  // mainWindow = new BrowserWindow({
  //   width: 800,
  //   height: 600,
  //   webPreferences: {
  //     nodeIntegration: true
  //   }
  // });
  // mainWindow.loadFile('index.html');
  createTray();
});

function createTray() {
  const iconPath = path.join(app.getAppPath(), 'resources', 'icon.png');
  console.log('Icon path:', iconPath); 


  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    // {
    //   label: 'Show App',
    //   click: () => {
    //     mainWindow.show();
    //   }
    // },
    // {
    //   label: 'Hide App',
    //   click: () => {
    //     mainWindow.hide();
    //   }
    // },
    // {
    //   label: 'Exit',
    //   click: () => {
    //     app.quit();
    //   }
    // }
  ]);
  
  tray.setToolTip('Silent Bye');
  tray.setContextMenu(contextMenu);
}
