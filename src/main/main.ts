/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, Tray, Menu } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import fs from 'fs';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const filePath = path.join(__dirname, './data.json');
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
console.log('000000000', filePath);
ipcMain.handle('get-data', async () => {
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(jsonData);
});

ipcMain.handle('add-data', async (event, newData) => {
  fs.writeFileSync(filePath, JSON.stringify(newData), 'utf-8');
  return newData;
});
// ipcMain.on('ipc-example', async (event, arg) => {
//   const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
//   console.log(msgTemplate(arg));
//   event.reply('ipc-example', msgTemplate('pong'));
// });

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    // width: 500,
    // height: 600,
    frame: false, // 无边框窗口
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  // mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
  mainWindow.on('blur', () => {
    mainWindow?.hide();
  });
  // 创建托盘图标
  tray = new Tray(getTaryIcon()); // 确保图标路径正确
  tray?.setTemplateImage?.(true); // 如果是单色图标，可以设置为模板图标
  // 右键菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '退出',
      role: 'quit',
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setToolTip('Reminder');
  // 点击托盘图标时的行为
  tray.on('click', () => {
    toggleWindow();
  });
  tray.on('right-click', (event, bounds) => {
    contextMenu.popup();
  });
};
function getTaryIcon() {
  let iconPath;
  if (process.platform === 'win32') {
    iconPath = getAssetPath('icons/tary_32x32.png'); // Windows常用16x16或32x32
  } else if (process.platform === 'darwin') {
    iconPath = getAssetPath('icons/tary@2x.png'); // macOS常用32x32或64x64
  } else {
    iconPath = getAssetPath('icons/tary_24x24.png'); // Linux常用22x22或24x24
  }
  return iconPath;
}
// 切换窗口显示/隐藏
function toggleWindow() {
  if (mainWindow?.isVisible()) {
    mainWindow.hide();
  } else {
    showWindow();
  }
}
// 显示窗口
function showWindow() {
  const trayBounds = tray?.getBounds() as Electron.Rectangle;
  const windowBounds = mainWindow?.getBounds() as Electron.Rectangle;

  // 设置窗口位置在托盘图标下方
  const x = Math.round(
    trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2,
  );
  const y = Math.round(trayBounds.y + trayBounds.height);
  mainWindow?.loadURL(resolveHtmlPath('index.html'));
  mainWindow?.setPosition(x, y, false);
  mainWindow?.show();
  mainWindow?.focus();
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
