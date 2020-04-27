import { app, BrowserWindow, globalShortcut } from 'electron'

const globalAny: any = global

let win: BrowserWindow

let Dev: boolean = false

function createWindow() {

	// Cria uma janela de navegação.
	win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
		}
	})

	// and load the index.html of the app.
	win.loadFile('./html/index.html')

	// Open the DevTools.
	//win.webContents.openDevTools()
}

app.allowRendererProcessReuse = true

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Algumas APIs podem ser usadas somente depois que este evento ocorre.
app.whenReady().then(() => {

	globalShortcut.register('f12', () => {

		if (!Dev) {

			win.webContents.openDevTools()
			Dev = true

		}
		else {

			win.webContents.closeDevTools()
			Dev = false

		}

	})

	globalShortcut.register('esc', () => {

		win.loadFile("./html/index.html")

	})

	createWindow()

	const ProgressBar = require('../src/electron-progressbar/source/index');

	globalAny.ProgressBar = ProgressBar

	win.maximize()

})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// No macOS é comum para aplicativos e sua barra de menu 
	// permaneçam ativo até que o usuário explicitamente encerre com Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})