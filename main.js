const { app, Tray, Menu, ipcMain, ipcRenderer} = require('electron')
const path = require('path')
const { execSync } = require('child_process')

let tray = null;

// Windows 시작 프로그램 등록을 위한 함수
function setAutoLaunch(enable) {
  const appFolder = path.dirname(process.execPath)
  const exeName = path.basename(process.execPath)

  try {
    if (enable) {
      // 시작 프로그램 등록 명령
      execSync(`reg add "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "YourAppName" /t REG_SZ /d "${path.join(appFolder, exeName)}" /f`)
    } else {
      // 시작 프로그램 제거 명령
      execSync(`reg delete "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "YourAppName" /f`)
    }
    return true
    
  } catch (error) {
    console.error('자동 실행 설정 중 오류 발생:', error)
    return false
  }
}

// 앱이 단일 인스턴스만 실행되도록 보장
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  // 두 번째 인스턴스 실행 시도 시 처리
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 기존 창 활성화 또는 트레이 아이콘 표시
    showWindow()
  })

  // 앱 준비 완료 시
  app.on('ready', () => {
    // 시작 시 트레이에 최소화된 상태로 시작
    createTray()
    
    // 커맨드 라인 인자에 --hidden이 있으면 창을 숨김
    if (!process.argv.includes('--hidden')) {
    }
  })
}

// 앱 종료 방지
app.on('window-all-closed', (e) => {
  e.preventDefault()
})

function createTray() {
  const iconPath = path.join(__dirname, './resources/icon.png') // 아이콘 경로 확인
  tray = new Tray(iconPath)
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '시작 시 자동 실행',
      type: 'checkbox',
      checked: isAutoLaunchEnabled(), // 현재 자동 실행 상태 확인
      click: (menuItem) => {
        setAutoLaunch(menuItem.checked)
      }
    },
    { type: 'separator' },
    { label: '종료', click: () => app.quit() }
  ])

  tray.setToolTip('Silent Bye App')
  tray.setContextMenu(contextMenu)
}

// 현재 자동 실행 상태 확인
function isAutoLaunchEnabled() {
  try {
    const output = execSync('reg query "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "YourAppName"')
    return output.toString().includes('YourAppName')
  } catch {
    return false
  }
}

// IPC 리스너 설정
ipcMain.handle('set-auto-launch', async (event, enable) => {
  setAutoLaunch(enable)
})

ipcMain.handle('get-auto-launch', async () => {
  return getAutoLaunchState()
})

// 현재 자동 실행 상태 확인
function getAutoLaunchState() {
  return app.getLoginItemSettings().openAtLogin
}

app.on('ready', () => {
  // 최초 실행 여부 확인
  const isFirstRun = !isAutoLaunchEnabled()
  
  if (isFirstRun) {
    setAutoLaunch(true) // 자동 실행 활성화
  }
  
  createTray()
})