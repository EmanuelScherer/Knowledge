import * as electronHome from 'electron';
import * as SwalHome from 'sweetalert2';
import * as axiosHome from 'axios'
 
const packHome = require('../package.json')
const ProgressBarHome = electronHome.remote.getGlobal('ProgressBar');
const downloadHome = electronHome.remote.getGlobal('download')
const fsHome = require('fs-extra')
const openExplorerHome = require('open-file-explorer');

interface ReturnLastRelease {
    "url": "https://api.github.com/repos/EmanuelScherer/Knowledge/releases/26672046",
    "assets_url": "https://api.github.com/repos/EmanuelScherer/Knowledge/releases/26672046/assets",
    "upload_url": "https://uploads.github.com/repos/EmanuelScherer/Knowledge/releases/26672046/assets{?name,label}",
    "html_url": "https://github.com/EmanuelScherer/Knowledge/releases/tag/v1.0.0",
    "id": 26672046,
    "node_id": "MDc6UmVsZWFzZTI2NjcyMDQ2",
    "tag_name": "v1.0.0",
    "target_commitish": "master",
    "name": "1.0.0",
    "draft": false,
    "author": {
        "login": "EmanuelScherer",
        "id": 60349021,
        "node_id": "MDQ6VXNlcjYwMzQ5MDIx",
        "avatar_url": "https://avatars3.githubusercontent.com/u/60349021?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/EmanuelScherer",
        "html_url": "https://github.com/EmanuelScherer",
        "followers_url": "https://api.github.com/users/EmanuelScherer/followers",
        "following_url": "https://api.github.com/users/EmanuelScherer/following{/other_user}",
        "gists_url": "https://api.github.com/users/EmanuelScherer/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/EmanuelScherer/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/EmanuelScherer/subscriptions",
        "organizations_url": "https://api.github.com/users/EmanuelScherer/orgs",
        "repos_url": "https://api.github.com/users/EmanuelScherer/repos",
        "events_url": "https://api.github.com/users/EmanuelScherer/events{/privacy}",
        "received_events_url": "https://api.github.com/users/EmanuelScherer/received_events",
        "type": "User",
        "site_admin": false
    },
    "prerelease": false,
    "created_at": "2020-05-19T14:14:21Z",
    "published_at": "2020-05-19T14:29:13Z",
    "assets": [
        {
            "url": "https://api.github.com/repos/EmanuelScherer/Knowledge/releases/assets/20874717",
            "id": 20874717,
            "node_id": "MDEyOlJlbGVhc2VBc3NldDIwODc0NzE3",
            "name": "knowledge-Setup-1.0.0.exe",
            "label": "",
            "uploader": {
                "login": "EmanuelScherer",
                "id": 60349021,
                "node_id": "MDQ6VXNlcjYwMzQ5MDIx",
                "avatar_url": "https://avatars3.githubusercontent.com/u/60349021?v=4",
                "gravatar_id": "",
                "url": "https://api.github.com/users/EmanuelScherer",
                "html_url": "https://github.com/EmanuelScherer",
                "followers_url": "https://api.github.com/users/EmanuelScherer/followers",
                "following_url": "https://api.github.com/users/EmanuelScherer/following{/other_user}",
                "gists_url": "https://api.github.com/users/EmanuelScherer/gists{/gist_id}",
                "starred_url": "https://api.github.com/users/EmanuelScherer/starred{/owner}{/repo}",
                "subscriptions_url": "https://api.github.com/users/EmanuelScherer/subscriptions",
                "organizations_url": "https://api.github.com/users/EmanuelScherer/orgs",
                "repos_url": "https://api.github.com/users/EmanuelScherer/repos",
                "events_url": "https://api.github.com/users/EmanuelScherer/events{/privacy}",
                "received_events_url": "https://api.github.com/users/EmanuelScherer/received_events",
                "type": "User",
                "site_admin": false
            },
            "content_type": "application/octet-stream",
            "state": "uploaded",
            "size": 66181419,
            "download_count": 0,
            "created_at": "2020-05-19T14:10:52Z",
            "updated_at": "2020-05-19T14:11:21Z",
            "browser_download_url": "https://github.com/EmanuelScherer/Knowledge/releases/download/v1.0.0/knowledge-Setup-1.0.0.exe"
        },
        {
            "url": "https://api.github.com/repos/EmanuelScherer/Knowledge/releases/assets/20874718",
            "id": 20874718,
            "node_id": "MDEyOlJlbGVhc2VBc3NldDIwODc0NzE4",
            "name": "knowledge-Setup-1.0.0.exe.blockmap",
            "label": "",
            "uploader": {
                "login": "EmanuelScherer",
                "id": 60349021,
                "node_id": "MDQ6VXNlcjYwMzQ5MDIx",
                "avatar_url": "https://avatars3.githubusercontent.com/u/60349021?v=4",
                "gravatar_id": "",
                "url": "https://api.github.com/users/EmanuelScherer",
                "html_url": "https://github.com/EmanuelScherer",
                "followers_url": "https://api.github.com/users/EmanuelScherer/followers",
                "following_url": "https://api.github.com/users/EmanuelScherer/following{/other_user}",
                "gists_url": "https://api.github.com/users/EmanuelScherer/gists{/gist_id}",
                "starred_url": "https://api.github.com/users/EmanuelScherer/starred{/owner}{/repo}",
                "subscriptions_url": "https://api.github.com/users/EmanuelScherer/subscriptions",
                "organizations_url": "https://api.github.com/users/EmanuelScherer/orgs",
                "repos_url": "https://api.github.com/users/EmanuelScherer/repos",
                "events_url": "https://api.github.com/users/EmanuelScherer/events{/privacy}",
                "received_events_url": "https://api.github.com/users/EmanuelScherer/received_events",
                "type": "User",
                "site_admin": false
            },
            "content_type": "application/octet-stream",
            "state": "uploaded",
            "size": 70419,
            "download_count": 0,
            "created_at": "2020-05-19T14:10:52Z",
            "updated_at": "2020-05-19T14:10:52Z",
            "browser_download_url": "https://github.com/EmanuelScherer/Knowledge/releases/download/v1.0.0/knowledge-Setup-1.0.0.exe.blockmap"
        },
        {
            "url": "https://api.github.com/repos/EmanuelScherer/Knowledge/releases/assets/20874734",
            "id": 20874734,
            "node_id": "MDEyOlJlbGVhc2VBc3NldDIwODc0NzM0",
            "name": "latest.yml",
            "label": "",
            "uploader": {
                "login": "EmanuelScherer",
                "id": 60349021,
                "node_id": "MDQ6VXNlcjYwMzQ5MDIx",
                "avatar_url": "https://avatars3.githubusercontent.com/u/60349021?v=4",
                "gravatar_id": "",
                "url": "https://api.github.com/users/EmanuelScherer",
                "html_url": "https://github.com/EmanuelScherer",
                "followers_url": "https://api.github.com/users/EmanuelScherer/followers",
                "following_url": "https://api.github.com/users/EmanuelScherer/following{/other_user}",
                "gists_url": "https://api.github.com/users/EmanuelScherer/gists{/gist_id}",
                "starred_url": "https://api.github.com/users/EmanuelScherer/starred{/owner}{/repo}",
                "subscriptions_url": "https://api.github.com/users/EmanuelScherer/subscriptions",
                "organizations_url": "https://api.github.com/users/EmanuelScherer/orgs",
                "repos_url": "https://api.github.com/users/EmanuelScherer/repos",
                "events_url": "https://api.github.com/users/EmanuelScherer/events{/privacy}",
                "received_events_url": "https://api.github.com/users/EmanuelScherer/received_events",
                "type": "User",
                "site_admin": false
            },
            "content_type": "text/yaml",
            "state": "uploaded",
            "size": 346,
            "download_count": 0,
            "created_at": "2020-05-19T14:11:22Z",
            "updated_at": "2020-05-19T14:11:22Z",
            "browser_download_url": "https://github.com/EmanuelScherer/Knowledge/releases/download/v1.0.0/latest.yml"
        }
    ],
    "tarball_url": "https://api.github.com/repos/EmanuelScherer/Knowledge/tarball/v1.0.0",
    "zipball_url": "https://api.github.com/repos/EmanuelScherer/Knowledge/zipball/v1.0.0",
    "body": ""
}

const loginHome = electronHome.remote.getGlobal('login')

console.log("Login: "+JSON.stringify(loginHome))

if (loginHome == undefined || loginHome == null || loginHome == {}) {

    SwalHome.default.fire('Não autenticado', 'Você deve entrar na sua conta para ver essa pagina', 'warning')
    .then(() => {

        electronHome.remote.getGlobal('win').loadFile('./html/login.html')

    })

}

electronHome.remote.getGlobal('win').webContents.session.on('will-download', (e: any, item: any, webContents: any) => {

	e.preventDefault()

    console.log("Baixando arquivo...")

    const progressBar = new ProgressBarHome({
        text: 'Baixando update...',
        detail: 'Espere...',
        title: 'Baixando...',
        indeterminate: false
    });

    progressBar.on('completed', function () {
        console.log("Update baixado")
        progressBar.detail = 'Baixado. Fechando...';
    })

    progressBar.on('aborted', function () {
        console.info(`get abortado`);
        SwalHome.default.fire('Erro no  download', 'error')
    });

    item.on('updated', (event: any, state: any) => {
        
        if (state === 'progressing') {

            if (!progressBar.isCompleted()) {

                progressBar.detail = Number(item.getReceivedBytes()/1048576).toFixed(2)+"mb baixados de "+Number(item.getTotalBytes()/1048576).toFixed(2)+"mb"

                progressBar.value = item.getReceivedBytes()/item.getTotalBytes()*100

            }

        }

    })

    item.once('done', (event: any, state: any) => {

        if (state === 'completed') {

            console.log('Download completo')

        } 
        else {

            console.log(`Download falha: ${state}`)

            progressBar.close()

        }

    })

})

const Update = async () => {

    await fsHome.emptyDir(electronHome.remote.getGlobal("app").getAppPath()+"/instaladores")

    await axiosHome.default.get("https://api.github.com/repos/EmanuelScherer/Knowledge/releases/latest")
    .then(async (r: axiosHome.AxiosResponse<ReturnLastRelease>) => {

        const Atual = packHome.version
        const Last = r.data.name

        console.log("Version Atual: "+Atual)
        console.log("Version Last: "+Last)

        if (Atual != Last) {

            SwalHome.default.fire({
                title: 'Update!',
                text: 'Novo update: v'+Atual+" -> v"+Last+'. Ele será baixado e instalado agora',
                icon: 'warning',
                showCancelButton: false,
            })
            .then(async (result) => {

                await downloadHome(electronHome.remote.getGlobal('win'), r.data.assets[0].browser_download_url, {directory: electronHome.remote.getGlobal("app").getAppPath()+'/instaladores'})

                SwalHome.default.fire({
                    title: 'Update!',
                    text: 'Update baixado. O programa será fechado para adicionar o update',
                    icon: 'warning',
                    showCancelButton: false,
                })
                .then(async (result) => {
                   
                    openExplorerHome(electronHome.remote.getGlobal("app").getAppPath()+'\\instaladores\\'+r.data.assets[0].name, (err: any) => {
                        if(err) {
                            console.log(err);

                            SwalHome.default.fire('Erro', 'O programa não pode abrir o explorador de arquivos', 'error')

                        }
                    });

                })

            })

        }
        else {

            console.log('Sem update')

        }

    })

}

Update()