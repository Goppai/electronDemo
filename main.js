// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const addon = require("@cc/findhasp");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var sudo = require("sudo-prompt");
var options = {
  name: "Electron"
};
var Sudoer = require("electron-sudo").default;

sudoer = new Sudoer(options);

/* Spawn subprocess behavior */

let mainWindow;
let loading;
let dialog;

async function a() {
  // Create the browser window.

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: "customButtonsOnHover",
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  dialog = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    show: false,
    parent: mainWindow,
    modal: true
  });
  loading = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    show: false
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  loading.loadFile("loading.html");
  dialog.loadFile("indexDialog.html");

  // await sudo.exec("echo hello", options, function(error, stdout, stderr) {
  //   console.log("stdout: " + stdout + stderr);
  //    if (error) app.quit();
  //    if (stdout) {
  //      console.log(addon.findHasp());
  //     if (addon.findHasp() === false) {
  //       dialog.show();
  //     }
  //     setInterval(function() {
  //       if(addon.findHasp() === false)
  //       dialog.show();
  //       }, 2000);
  //    }
  // });
  let cp = await sudoer.spawn("echo", ["$PARAM"], { env: { PARAM: "VALUE" } });
  cp.on("close", () => {
    app.quit();
  });
  if (cp) {
    console.log(addon.findHasp());
    if (addon.findHasp() === false) {
      dialog.show();
    }
    setInterval(function() {
      if (addon.findHasp() === false) dialog.show();
    }, 2000);
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  const ipc = require("electron").ipcMain;

  ipc.on("news", function() {
    if (addon.findHasp() === false) {
      app.quit();
    } else {
      dialog.hide();
      loading.show();
      mainWindow.close();
    }
  });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", a);

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
