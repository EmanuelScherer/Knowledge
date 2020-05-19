import { app, BrowserWindow, globalShortcut, Menu, ipcRenderer } from 'electron'
import Swal from 'sweetalert2';

const { autoUpdater } = require('electron-updater');

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

	autoUpdater.checkForUpdatesAndNotify();

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

autoUpdater.setFeedURL({
	"provider": "github",
	"owner": "EmanuelScherer",
	"token": "c36b04a435ed62d168e59120da16ad599a72dd1e",
	"repo": "Knowledge"
});

autoUpdater.on('update-available', () => {
	win.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
	win.webContents.send('update_downloaded');
});

ipcRenderer.on('update_available', () => {
	ipcRenderer.removeAllListeners('update_available');
	
	Swal.fire('Update!', '', 'warning')

});

ipcRenderer.on('update-downloaded', () => {
	ipcRenderer.removeAllListeners('update-downloaded');
	
	Swal.fire('Update baixado!', '', 'success')

});