const { app, BrowserWindow, Menu, dialog, utilityProcess } = require('electron');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
app.setName('Liqu3D Local');
const projectRoot = path.resolve(__dirname, '..');
let backend, window, quitting = false, readyUrl;
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { window?.show(); window?.focus(); });
  app.whenReady().then(async () => {
    app.dock?.setIcon(path.join(__dirname, 'icons', 'app.png'));
    const token = randomBytes(32).toString('hex');
    const dataDir = path.join(app.getPath('userData'), 'data');
    const backendEnv = {...process.env};
    // Finder omits Homebrew; preserve the native Windows/Linux search path.
    if (process.platform === 'darwin') backendEnv.PATH = ['/opt/homebrew/bin', '/usr/local/bin', process.env.PATH || '/usr/bin:/bin'].join(path.delimiter);
    backend = utilityProcess.fork(path.join(projectRoot, 'server.mjs'), [], {
      cwd: projectRoot, serviceName: 'Liqu3D native renderer', stdio: 'pipe',
      env: {...backendEnv, PORT:'0', PMM_DATA_DIR:dataDir, LIQU3D_DESKTOP_TOKEN:token, PMM_RENDERER_URL:'', PMM_TRUST_PROXY:'0', PMM_PUBLIC_ORIGIN:''}
    });
    let errors='';
    backend.stdout.on('data', chunk => process.stdout.write(chunk));
    backend.stderr.on('data', chunk => {errors=(errors+chunk).slice(-12000);process.stderr.write(chunk);});
    const timeout=setTimeout(()=>{if(!readyUrl){dialog.showErrorBox('Liqu3D could not start',errors||'The local service did not respond.');app.quit();}},30000);
    backend.on('exit',code=>{clearTimeout(timeout);backend=null;if(!quitting){dialog.showErrorBox('Liqu3D stopped',errors||`Local service exited (${code}).`);app.quit();}});
    backend.on('message',async message=>{
      if(message.type!=='ready'||readyUrl)return;
      clearTimeout(timeout);readyUrl=message.url;
      window=new BrowserWindow({width:1440,height:940,minWidth:780,minHeight:560,title:'Liqu3D Local',icon:path.join(__dirname,'icons','app.png'),backgroundColor:'#17181b',show:false,
        webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
      window.webContents.session.webRequest.onBeforeSendHeaders({urls:[`${readyUrl}/*`]},(details,callback)=>{
        details.requestHeaders['x-liqu3d-desktop']=token;callback({requestHeaders:details.requestHeaders});
      });
      window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
      window.webContents.on('will-navigate',(event,url)=>{if(new URL(url).origin!==readyUrl)event.preventDefault();});
      window.webContents.on('will-prevent-unload',event=>{
        const choice=dialog.showMessageBoxSync(window,{type:'question',buttons:['Keep editing','Close without saving'],defaultId:0,cancelId:0,message:'Close without saving your changes?'});
        if(choice===1)event.preventDefault();
      });
      window.once('ready-to-show',()=>window.show());
      await window.loadURL(readyUrl);
    });
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {label:'Liqu3D Local',submenu:[{role:'about'},{type:'separator'},{role:'quit'}]},
      {role:'editMenu'}, {label:'View',submenu:[{role:'reload'},{role:'togglefullscreen'},{role:'toggleDevTools'}]},
      {label:'Projects',submenu:[{label:'Open library',click:()=>window?.loadURL(`${readyUrl}/projects`)}]}
    ]));
  }).catch(error=>{dialog.showErrorBox('Liqu3D could not start',error.message);app.quit();});
  app.on('window-all-closed',()=>app.quit());
  app.on('before-quit',event=>{
    if(window && !window.isDestroyed() && !quitting) { event.preventDefault(); window.close(); return; }
    if(backend&&!quitting){event.preventDefault();quitting=true;backend.once('exit',()=>app.quit());backend.kill();setTimeout(()=>app.exit(0),12000).unref();}
  });
}
