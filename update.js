"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SwalHome = require("sweetalert2");
const axiosHome = require("axios");
const packHome = require('./package.json');

const ProgressBarHome = global.ProgressBar;
const downloadHome = global.download;
const fsHome = require('fs-extra');
const openExplorerHome = require('open-file-explorer');
const loginHome = global.login;
console.log("Login: " + JSON.stringify(loginHome));
global.win.webContents.session.on('will-download', (e, item, webContents) => {
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
exports.Update = async () => {
    await fsHome.emptyDir(global.app.getAppPath() + "/instaladores");
    await axiosHome.default.get("https://api.github.com/repos/EmanuelScherer/Knowledge/releases/latest")
        .then(async (r) => {
        const Atual = packHome.version;
        const Last = r.data.name;
        console.log("Version Atual: " + Atual);
        console.log("Version Last: " + Last);
        if (Atual != Last) {
            SwalHome.default.fire({
                title: 'Update!',
                text: 'Novo update: v' + Atual + " -> v" + Last + '. Ele será baixado e instalado agora',
                icon: 'warning',
                showCancelButton: false,
            })
                .then(async (result) => {
                await downloadHome(global.win, r.data.assets[0].browser_download_url, { directory: global.app.getAppPath() + '/instaladores' });
                SwalHome.default.fire({
                    title: 'Update!',
                    text: 'Update baixado. O programa será fechado para adicionar o update',
                    icon: 'warning',
                    showCancelButton: false,
                })
                    .then(async (result) => {
                    openExplorerHome(global.app.getAppPath() + '\\instaladores\\' + r.data.assets[0].name, (err) => {
                        if (err) {
                            console.log(err);
                            SwalHome.default.fire('Erro', 'O programa não pode abrir o explorador de arquivos', 'error');
                        }
                    });
                });
            });
        }
        else {
            console.log('Sem update');
        }
    });
};
