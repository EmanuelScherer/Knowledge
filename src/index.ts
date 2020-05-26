import { app, BrowserWindow, globalShortcut, Menu, ipcMain } from 'electron'

const globalAny: any = global

let win: BrowserWindow

let Dev: boolean = false

const {download} = require('electron-dl');
const fs = require('fs-extra')

function createWindow() {

	// Cria uma janela de navegação.
	win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			nodeIntegrationInWorker: true
		}
	})

	let menu = Menu.buildFromTemplate([
		{
			label: 'Menu',
			submenu: [
				{label:'Home', click: () => {win.loadFile('./html/index.html')}, accelerator: 'esc'},
				{type: 'separator'},
				{label:'Documentação', click: () => {}, accelerator: 'ctrl+1'},
				{label:'Team Meeting', click: () => {win.loadFile('./html/meeting.html')}, accelerator: 'ctrl+2'},
				{label:'Conhecimentos', click: () => {}, accelerator: 'ctrl+3'}
			]
		},
		{
			label: 'Window',
			submenu: [
				{label:'Maximizar', click: () => {win.maximize()}},
				{label:'Minimizar', click: () => {win.minimize()}},
				{type: 'separator'},
				{label:'Ativar/Desativar Tela cheia', click: () => {
					
					if (win.isFullScreen()) {

						win.setFullScreen(false)

					}
					else {

						win.setFullScreen(true)

					}
				
				}, accelerator: 'f11'},
				{type: 'separator'},
				{label:'Sair', click: () => {app.exit()}}

			]
		}
	])
	Menu.setApplicationMenu(menu); 

	globalAny.win = win

	// and load the index.html of the app.
	win.loadFile('./html/login.html')

	// Open the DevTools.
	//win.webContents.openDevTools()
}

app.allowRendererProcessReuse = true

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Algumas APIs podem ser usadas somente depois que este evento ocorre.
app.whenReady().then(() => {

	globalShortcut.register('ctrl+shift+i', () => {

		if (!Dev) {

			win.webContents.openDevTools()
			Dev = true

		}
		else {

			win.webContents.closeDevTools()
			Dev = false

		}

	})

	// globalShortcut.register('esc', () => {

	// 	win.loadFile("./html/index.html")

	// })

	const ProgressBar = require('../src/electron-progressbar/source/index');

	globalAny.ProgressBar = ProgressBar
	globalAny.app = app
	globalAny.download = download

	createWindow()

	win.maximize()

})

ipcMain.on('SetLogin', (event, value) => {

	globalAny.login = value

})

// Quit when all windows are closed.
app.on('window-all-closed', async () => {
	// No macOS é comum para aplicativos e sua barra de menu 
	// permaneçam ativo até que o usuário explicitamente encerre com Cmd + Q
	if (process.platform !== 'darwin') {
		
		await fs.emptyDir(app.getAppPath()+'/instaladores')

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