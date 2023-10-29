import { app, BrowserWindow, ipcMain, net} from 'electron'
import YTDlpWrap from 'yt-dlp-wrap';
const pathToFfmpeg = require('ffmpeg-static')
const player= require('play-sound')();
const fs = require('fs');
require('dotenv').config();
import path from 'node:path';

let ytDlpWrap: YTDlpWrap;

let audio: any = undefined;


process.env.ROOT = path.join(__dirname, '../');


//Download the yt-dlp binary for the given version and platform to the provided path.
//By default the latest version will be downloaded to "./yt-dlp" and platform = os.platform().

YTDlpWrap.downloadFromGithub(
    'yt-dlp_macos',
    '2023.10.13',
    process.platform
).then(() => {
  ytDlpWrap = new YTDlpWrap(process.env.ROOT + './yt-dlp_macos');
  console.log('ytdlp initialized!')
}).catch((error) => {
  console.log(error);
})



process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      nodeIntegrationInWorker: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    width: 853,
    height: 400,
    frame: false,
    transparent: true,
    resizable: false,
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    win = null
    app.quit()
});

app.on('before-quit', () => {
  if (audio) {
    // Stop and kill the audio when the app is quitting
    audio.kill();
    audio = undefined;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

import installExtension, { REDUX_DEVTOOLS } from 'electron-devtools-installer';

app.whenReady().then(() => {
    installExtension(REDUX_DEVTOOLS)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));
    // Call the downloadAndPlayAudio function to start the process
});




async function downloadAndPlayAudio(videoId: string) {
  if(audio) {
    audio.kill()
    audio = undefined;
  } 
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  try {

    // Check if the file already exists in the location
    const outputFileName = './audio/music.mp3';

    if(fs.existsSync(outputFileName)){ // remove the file there if it exists

      await fs.unlink('./audio/music.mp3', (err: any) => {
        if(err){
          console.log(`Error deleting the file at path: ${err}`);
        } else {
          console.log('File has been deleted');
        }
      });
    }

    const stdout = await ytDlpWrap.execPromise([
      videoUrl,
      '--audio-quality', '0',  // Best audio quality
      '--extract-audio',
      '--audio-format', 'mp3',
      '--output', outputFileName,
      '--ffmpeg-location', pathToFfmpeg, // Specify the FFmpeg binary location
   
    ]);
    console.log(stdout);
    console.log('Converted to ffmpeg');

    // Now, play the downloaded MP3 audio using a player library
 
      audio = player.play(outputFileName, (error: any) => {
        if (error) {
          console.error('Error playing audio:', error);
        } else {
          console.log('Audio playback complete.');
        }
      });
  
  } catch (error) {
    console.error('Error downloading and converting audio:', error);
    win?.close();
  }
}

ipcMain.handle('playAudio', (event: any, videoId: string) => {
  downloadAndPlayAudio(videoId);
})


ipcMain.handle('searchAudio', (event: any, query) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/search/?key=${apiKey}&q=${query}&type=video&part=snippet`;
  // console.log(url);
  const request = net.request(url)
  let data: any;
  request.on('response', (response) => {
    // console.log(`STATUS: ${response.statusCode}`)
    // console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
    response.on('data', (chunk) => {
      // console.log(`BODY: ${chunk}`)
      data = new TextDecoder('utf-8').decode(chunk);
    })
    response.on('end', () => {
      win?.webContents.send('gotData', data);
    })
    
  })
  request.end()

  
})
