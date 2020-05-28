"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const electronaaaaaaaaaaaaa = require('electron')

const axiosHome = require("axios");
const packHome = require('../package.json');
const SwalHome = require('sweetalert2')

const ProgressBarHome = electronaaaaaaaaaaaaa.remote.getGlobal('ProgressBar');
const downloadHome = electronaaaaaaaaaaaaa.remote.getGlobal('download');
const fsHome = require('fs-extra');
const openExplorerHome = require('open-file-explorer');
const { ipcRenderer } = require('electron');
const loginHome = electronaaaaaaaaaaaaa.remote.getGlobal('login');
console.log("Login: " + JSON.stringify(loginHome));

const Will = async () => {

    console.log("DownloadFallback: "+electronaaaaaaaaaaaaa.remote.getGlobal('DownloadFallback'))

    if (!electronaaaaaaaaaaaaa.remote.getGlobal('DownloadFallback')) {

        electronaaaaaaaaaaaaa.remote.getGlobal('win').webContents.session.on('will-download', (e, item, webContents) => {
            e.preventDefault();
            console.log("Baixando arquivo...");
            const progressBar = new ProgressBarHome({
                text: 'Baixando update...',
                detail: 'Espere...',
                title: 'Baixando...',
                indeterminate: false
            });
            progressBar.on('completed', function () {
                console.log("Update baixado");
                progressBar.detail = 'Baixado. Fechando...';
            });
            progressBar.on('aborted', function () {
                console.info(`get abortado`);
                SwalHome.default.fire('Erro no  download', 'error');
            });
            item.on('updated', (event, state) => {
                if (state === 'progressing') {
                    if (!progressBar.isCompleted()) {
                        progressBar.detail = Number(item.getReceivedBytes() / 1048576).toFixed(2) + "mb baixados de " + Number(item.getTotalBytes() / 1048576).toFixed(2) + "mb";
                        progressBar.value = item.getReceivedBytes() / item.getTotalBytes() * 100;
                    }
                }
            });
            item.once('done', (event, state) => {
                if (state === 'completed') {
                    console.log('Download completo');
                }
                else {
                    console.log(`Download falha: ${state}`);
                    progressBar.close();
                }
            });
        });

        ipcRenderer.send('DownloadFallback', true)

    }

}

const Update = async () => {
    await fsHome.emptyDir(electronaaaaaaaaaaaaa.remote.getGlobal('app').getAppPath() + "/instaladores");
    await axiosHome.default.get("https://api.github.com/repos/EmanuelScherer/Knowledge/releases/latest")
        .then(async (r) => {

            let Atual = packHome.version
            let Last = r.data.name

            while (Atual.includes(".")) {

                Atual = Atual.replace(".", "");

            }

            while (Last.includes(".")) {

                Last = Last.replace(".", "");

            }

        Atual = parseInt(Atual);
        Last = parseInt(Last);
        console.log("Version Atual: " + Atual);
        console.log("Version Last: " + Last);
        if (Atual < Last) {

                SwalHome.fire({
                    title: 'Update!',
                    text: 'Novo update: v' + Atual + " -> v" + Last + '. Ele será baixado e instalado agora',
                    icon: 'warning',
                    showCancelButton: false,
                })
                .then(async (result) => {
                    await downloadHome(electronaaaaaaaaaaaaa.remote.getGlobal('win'), r.data.assets[0].browser_download_url, { directory: electronaaaaaaaaaaaaa.remote.getGlobal('app').getAppPath() + '/instaladores' });
                    SwalHome.default.fire({
                        title: 'Update!',
                        text: 'Update baixado. O programa será fechado para adicionar o update',
                        icon: 'warning',
                        showCancelButton: false,
                    })
                        .then(async (result) => {
                        openExplorerHome(electronaaaaaaaaaaaaa.remote.getGlobal('app').getAppPath() + '\\instaladores\\' + r.data.assets[0].name, (err) => {
                            if (err) {
                                console.log(err);
                                SwalHome.default.fire('Erro', 'O programa não pode abrir o explorador de arquivos', 'error');
                            }
                        });
                    });
                })
        }
        else {
            console.log('Sem update');
        }
    });
};

Will()
Update()