const { app, BrowserWindow, ipcMain, shell } = require('electron')
const { autoUpdater } = require('electron-updater')

let mainWindow
const port = process.env.PORT || 8080

autoUpdater.on('update-available', information => {
  mainWindow.webContents.send('update-available', { state: true, information })
})

autoUpdater.on('update-not-available', () => {
  mainWindow.webContents.send('update-available', {
    state: false,
  })
})

ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall()
})

ipcMain.on('open-release-link', (event, url) => {
  shell.openExternal(url)
})

autoUpdater.on('download-progress', progressObj => {
  mainWindow.webContents.send('download-progress', progressObj)
})

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-downloaded')
})

function createWindow() {
  if (process.env.NODE_ENV === 'production') {
    autoUpdater.checkForUpdates()
  }

  const winURL =
    process.env.NODE_ENV === 'production'
      ? `file://${__dirname}/index.html`
      : `http://localhost:${port}/dist`

  mainWindow = new BrowserWindow({
    useContentSize: true,
    titleBarStyle: 'hiddenInset',
    height: 800,
    width: 550,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
    },
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
