#include "ConnectDialog.h"
#include "Finder930QTMYV2.h"
#include <QGridLayout>
#include <QPushButton>
#include <QLabel>
#include <QCoreApplication>
#include <QMessageBox>

ConnectDialog::ConnectDialog(Finder930QTMYV2* mainWin, QWidget* parent)
    : QDialog(parent), m_main(mainWin)
{
    setWindowTitle("Device Connection");

    auto layout = new QGridLayout(this);

    // Row 0: Spectrometer
    layout->addWidget(new QLabel("Spectrometer"), 0, 0);
    m_specConnBtn = new QPushButton("Connect");
    m_specDiscBtn = new QPushButton("Disconnect");
    layout->addWidget(m_specConnBtn, 0, 1);
    layout->addWidget(m_specDiscBtn, 0, 2);

    // Row 1: CCD
    layout->addWidget(new QLabel("CCD (Andor)"), 1, 0);
    m_ccdConnBtn = new QPushButton("Connect");
    m_ccdDiscBtn = new QPushButton("Disconnect");
    layout->addWidget(m_ccdConnBtn, 1, 1);
    layout->addWidget(m_ccdDiscBtn, 1, 2);

    // Row 2: Laser
    layout->addWidget(new QLabel("Laser"), 2, 0);
    m_laserConnBtn = new QPushButton("Connect");
    m_laserDiscBtn = new QPushButton("Disconnect");
    layout->addWidget(m_laserConnBtn, 2, 1);
    layout->addWidget(m_laserDiscBtn, 2, 2);

    // Row 3: Stage
    layout->addWidget(new QLabel("Stage"), 3, 0);
    m_stageConnBtn = new QPushButton("Connect");
    m_stageDiscBtn = new QPushButton("Disconnect");
    layout->addWidget(m_stageConnBtn, 3, 1);
    layout->addWidget(m_stageDiscBtn, 3, 2);

    // Row 4: Motor
    layout->addWidget(new QLabel("Motor"), 4, 0);
    m_motorConnBtn = new QPushButton("Connect");
    m_motorDiscBtn = new QPushButton("Disconnect");
    layout->addWidget(m_motorConnBtn, 4, 1);
    layout->addWidget(m_motorDiscBtn, 4, 2);

    // Row 5: Camera
    layout->addWidget(new QLabel("Camera (ST500)"), 5, 0);
    m_cameraConnBtn = new QPushButton("Connect");
    m_cameraDiscBtn = new QPushButton("Disconnect");
    layout->addWidget(m_cameraConnBtn, 5, 1);
    layout->addWidget(m_cameraDiscBtn, 5, 2);


    // Set initial button states based on current connection
    m_specConnBtn->setEnabled(m_main->m_specHandle < 0);
    m_specDiscBtn->setEnabled(m_main->m_specHandle >= 0);
    m_ccdConnBtn->setEnabled(m_main->m_ccdId <= 0);
    m_ccdDiscBtn->setEnabled(m_main->m_ccdId > 0);
    m_laserConnBtn->setEnabled(!m_main->m_laserConnected);
    m_laserDiscBtn->setEnabled(m_main->m_laserConnected);
    m_stageConnBtn->setEnabled(m_main->m_stageHandle == nullptr);
    m_stageDiscBtn->setEnabled(m_main->m_stageHandle != nullptr);
    m_motorConnBtn->setEnabled(!m_main->m_motorConnected);
    m_motorDiscBtn->setEnabled(m_main->m_motorConnected);
    m_cameraConnBtn->setEnabled(!m_main->m_cameraConnected);
    m_cameraDiscBtn->setEnabled(m_main->m_cameraConnected);


    connect(m_specConnBtn, &QPushButton::clicked, this, &ConnectDialog::onSpecConnect);
    connect(m_specDiscBtn, &QPushButton::clicked, this, &ConnectDialog::onSpecDisconnect);
    connect(m_ccdConnBtn, &QPushButton::clicked, this, &ConnectDialog::onCcdConnect);
    connect(m_ccdDiscBtn, &QPushButton::clicked, this, &ConnectDialog::onCcdDisconnect);
    connect(m_laserConnBtn, &QPushButton::clicked, this, &ConnectDialog::onLaserConnect);
    connect(m_laserDiscBtn, &QPushButton::clicked, this, &ConnectDialog::onLaserDisconnect);
    connect(m_stageConnBtn, &QPushButton::clicked, this, &ConnectDialog::onStageConnect);
    connect(m_stageDiscBtn, &QPushButton::clicked, this, &ConnectDialog::onStageDisconnect);
    connect(m_motorConnBtn, &QPushButton::clicked, this, &ConnectDialog::onMotorConnect);
    connect(m_motorDiscBtn, &QPushButton::clicked, this, &ConnectDialog::onMotorDisconnect);
    connect(m_cameraConnBtn, &QPushButton::clicked, this,&ConnectDialog::onCameraConnect);
    connect(m_cameraDiscBtn, &QPushButton::clicked, this,&ConnectDialog::onCameraDisconnect);
}

void ConnectDialog::onSpecConnect()
{
    if (!m_main->m_hSpecDll) {
        QString path = QCoreApplication::applicationDirPath() + "/spectrometer_x86.dll";
        m_main->m_hSpecDll = LoadLibraryA(path.toLocal8Bit().constData());
        if (!m_main->m_hSpecDll) {
            m_main->log("Spectrometer DLL load FAILED");
            return;
        }
    }

    typedef int (*Fn_spec_open)(const char*);
    auto specOpen = (Fn_spec_open)GetProcAddress(m_main->m_hSpecDll, "spec_open");
    if (!specOpen) { m_main->log("GetProcAddress spec_open FAILED"); return; }

    m_main->m_specHandle = specOpen("SR-5801");
    if (m_main->m_specHandle >= 0) {
        m_specConnBtn->setEnabled(false);
        m_specDiscBtn->setEnabled(true);
        m_main->log("Spectrometer connected (SR-5801)");
    }
    else {
        m_main->log("Spectrometer open FAILED");
    }
}

void ConnectDialog::onSpecDisconnect()
{
    typedef bool (*Fn_spec_close)(int);
    auto specClose = (Fn_spec_close)GetProcAddress(m_main->m_hSpecDll, "spec_close");
    if (specClose) specClose(m_main->m_specHandle);
    m_main->m_specHandle = -1;
    m_specConnBtn->setEnabled(true);
    m_specDiscBtn->setEnabled(false);
    m_main->log("Spectrometer disconnected");
}


void ConnectDialog::onCcdConnect()
{
    if (m_main->m_ccdId > 0) {
        m_main->log("CCD already connected");
        return;
    }

    // 1) 按旧Finder930逻辑加载CCD库（zl_ccd_x86.dll）
    if (!m_main->m_hDfieldDll) {
        QString path = QCoreApplication::applicationDirPath() + "/zl_ccd_x86.dll";
        m_main->m_hDfieldDll = LoadLibraryA(path.toLocal8Bit().constData());
        if (!m_main->m_hDfieldDll) {
            m_main->log("Load zl_ccd_x86.dll FAILED");
            return;
        }
    }

    // 2) 解析旧流程所需接口：InitCCDDll -> Connect
    typedef void (*Fn_InitCCDDll)(int, char*);
    typedef bool (*Fn_Connect)();
    typedef bool (*Fn_GetDevSize)(int&, int&);
    typedef bool (*Fn_GetPixSize)(float&);

    auto InitCCDDll = (Fn_InitCCDDll)GetProcAddress(m_main->m_hDfieldDll, "InitCCDDll");
    auto CcdConnect = (Fn_Connect)GetProcAddress(m_main->m_hDfieldDll, "Connect");
    auto GetDevSize = (Fn_GetDevSize)GetProcAddress(m_main->m_hDfieldDll, "GetDevSize");
    auto GetPixSize = (Fn_GetPixSize)GetProcAddress(m_main->m_hDfieldDll, "GetPixSize");
    if (!InitCCDDll || !CcdConnect) {
        m_main->log("CCD GetProcAddress FAILED");
        return;
    }

    // 3) 打印实际DLL路径，便于确认运行环境
    char dllPath[MAX_PATH] = { 0 };
    if (GetModuleFileNameA(m_main->m_hDfieldDll, dllPath, MAX_PATH) > 0) {
        m_main->log(QString("CCD DLL loaded: %1").arg(QString::fromLocal8Bit(dllPath)));
    }

    // 4) 旧程序A4对应nMode=3（ProtocolCcd里的映射）
    const int ccdMode = 3; // A4
    InitCCDDll(ccdMode, (char*)"");
    Sleep(100);

    if (CcdConnect()) {
        // 5) 连接后读取基础信息（可选，便于验证）
        if (GetDevSize) {
            int w = 0, h = 0;
            if (GetDevSize(w, h)) {
                m_main->log(QString("CCD size: %1 x %2").arg(w).arg(h));
            }
        }
        if (GetPixSize) {
            float pix = 0.0f;
            if (GetPixSize(pix)) {
                m_main->log(QString("CCD pixel size: %1").arg(pix));
            }
        }

        m_main->m_ccdId = 1;
        m_ccdConnBtn->setEnabled(false);
        m_ccdDiscBtn->setEnabled(true);
        m_main->log("CCD (A4) connected");
        m_main->onCcdConnectionChanged(true);
    }
    else {
        m_main->log("CCD (A4) connect FAILED");
    }
}

void ConnectDialog::onCcdDisconnect()
{
    if (m_main->m_ccdId <= 0) {
        m_main->log("CCD not connected");
        return;
    }

    // 按旧逻辑调用DisConnect
    typedef bool (*Fn_DisConnect)();
    auto CcdDisConnect = (Fn_DisConnect)GetProcAddress(m_main->m_hDfieldDll, "DisConnect");
    if (CcdDisConnect) {
        CcdDisConnect();
    }

    m_main->m_ccdId = -1;
    m_ccdConnBtn->setEnabled(true);
    m_ccdDiscBtn->setEnabled(false);
    m_main->log("CCD (A4) disconnected");
    m_main->onCcdConnectionChanged(false);
}
void ConnectDialog::onLaserConnect()
{
    if (m_main->m_laserConnected) {
        m_main->log("Laser already connected");
        return;
    }

    if (!m_main->m_hLaserDll) {
        QString path = QCoreApplication::applicationDirPath() + "/api.rtslaser_x86.dll";
        m_main->m_hLaserDll = LoadLibraryA(path.toLocal8Bit().constData());
        if (!m_main->m_hLaserDll) {
            m_main->log("Load api.rtslaser_x86.dll FAILED");
            return;
        }
    }

    // 1) 解析激光器DLL接口（最小必需：初始化/连接/断开/归零）
    typedef bool (*Fn_InitLaserDll)(int&, char*);
    typedef bool (*Fn_Connect)(int);
    typedef bool (*Fn_DisConnect)();
    typedef bool (*Fn_ToHome)();
    auto InitLaserDll = (Fn_InitLaserDll)GetProcAddress(m_main->m_hLaserDll, "InitLaserDll");
    auto LaserConnect = (Fn_Connect)GetProcAddress(m_main->m_hLaserDll, "Connect");
    auto LaserDisConnect = (Fn_DisConnect)GetProcAddress(m_main->m_hLaserDll, "DisConnect");
    auto LaserToHome = (Fn_ToHome)GetProcAddress(m_main->m_hLaserDll, "ToHome");
    if (!InitLaserDll || !LaserConnect || !LaserDisConnect || !LaserToHome) {
        m_main->log("Laser GetProcAddress FAILED");
        return;
    }

    // 2) 打印实际加载路径，便于确认环境中的DLL版本
    char dllPath[MAX_PATH] = { 0 };
    if (GetModuleFileNameA(m_main->m_hLaserDll, dllPath, MAX_PATH) > 0) {
        m_main->log(QString("Laser DLL loaded: %1").arg(QString::fromLocal8Bit(dllPath)));
    }

    // 3) 初始化DLL
    int nVer = 0;
    if (!InitLaserDll(nVer, nullptr)) {
        m_main->log("InitLaserDll FAILED");
        return;
    }
    m_main->log(QString("Laser DLL initialized, ver=%1").arg(nVer));

    // 4) 固定COM5连接 + 归零初始化（失败重试一次）
    const int fixedPort = 5;
    if (!LaserConnect(fixedPort)) {
        m_main->log("Laser connect FAILED (COM5)");
        return;
    }

    Sleep(150);
    if (!(LaserToHome() || (Sleep(260), LaserToHome()))) {
        m_main->log("Laser init FAILED at ToHome (COM5)");
        LaserDisConnect();
        m_main->log("Laser connect/init FAILED");
        return;
    }

    m_main->m_laserConnected = true;
    m_laserConnBtn->setEnabled(false);
    m_laserDiscBtn->setEnabled(true);
    m_main->log("Laser connected and initialized (COM5)");
}

void ConnectDialog::onLaserDisconnect()
{
    if (!m_main->m_laserConnected) {
        m_main->log("Laser not connected");
        return;
    }

    // 断开时仅调用DisConnect，保持最小实现
    typedef bool (*Fn_DisConnect)();
    auto LaserDisConnect = (Fn_DisConnect)GetProcAddress(m_main->m_hLaserDll, "DisConnect");
    if (LaserDisConnect) {
        if (LaserDisConnect()) {
            m_main->log("Laser disconnected");
        } else {
            m_main->log("Laser disconnect FAILED");
        }
    } else {
        m_main->log("Laser disconnect: API not ready");
    }

    m_main->m_laserConnected = false;
    m_laserConnBtn->setEnabled(true);
    m_laserDiscBtn->setEnabled(false);
}

void ConnectDialog::onStageConnect() {
    if (m_main->m_stageHandle) {
        m_main->log("Stage already connected");
        return;
    }

    const auto choice = QMessageBox::question(
        this,
        "Stage Initialization",
        "Initialize stage after connecting?\nYes: connect + initialize\nNo: connect only",
        QMessageBox::Yes | QMessageBox::No,
        QMessageBox::Yes);
    const bool needInit = (choice == QMessageBox::Yes);

    if (!m_main->m_hStageDll) {
        QString path = QCoreApplication::applicationDirPath() + "/zl_controlmce_x86.dll";
        m_main->m_hStageDll = LoadLibraryA(path.toLocal8Bit().constData());
        if (!m_main->m_hStageDll) {
            m_main->log("Load zl_controlmce_x86.dll FAILED");
            return;
        }
    }

    typedef void (*Fn_InitMceDll)(int, char*);
    typedef void* (*Fn_OpenDevice)(char*);
    typedef bool (*Fn_CloseMotor)(void*);
    typedef bool (*Fn_GetIsOpen)(void*);
    typedef bool (*Fn_GetVelocity)(void*, double*);
    typedef bool (*Fn_GetAccVelocity)(void*, double*);
    typedef bool (*Fn_MotorBackZero)(void*, int);
    typedef bool (*Fn_GetPosition)(void*, int, double&);
    typedef bool (*Fn_MotorMoveto)(void*, int, double);

    auto InitMceDll = (Fn_InitMceDll)GetProcAddress(m_main->m_hStageDll, "InitMceDll");
    auto OpenDevice = (Fn_OpenDevice)GetProcAddress(m_main->m_hStageDll, "OpenDevice");
    auto CloseMotor = (Fn_CloseMotor)GetProcAddress(m_main->m_hStageDll, "CloseMotor");
    auto GetIsOpen = (Fn_GetIsOpen)GetProcAddress(m_main->m_hStageDll, "GetIsOpen");
    auto GetVelocity = (Fn_GetVelocity)GetProcAddress(m_main->m_hStageDll, "GetVelocity");
    auto GetAccVelocity = (Fn_GetAccVelocity)GetProcAddress(m_main->m_hStageDll, "GetAccVelocity");
    auto MotorBackZero = (Fn_MotorBackZero)GetProcAddress(m_main->m_hStageDll, "MotorBackZero");
    auto GetPosition = (Fn_GetPosition)GetProcAddress(m_main->m_hStageDll, "GetPosition");
    auto MotorMoveto = (Fn_MotorMoveto)GetProcAddress(m_main->m_hStageDll, "MotorMoveto");

    if (!InitMceDll || !OpenDevice || !CloseMotor || !GetIsOpen || !GetVelocity || !GetAccVelocity ||
        !MotorBackZero || !GetPosition || !MotorMoveto) {
        m_main->log("Stage GetProcAddress FAILED");
        return;
    }

    char dllPath[MAX_PATH] = { 0 };
    if (GetModuleFileNameA(m_main->m_hStageDll, dllPath, MAX_PATH) > 0) {
        m_main->log(QString("Stage DLL loaded: %1").arg(QString::fromLocal8Bit(dllPath)));
    }

    char comPort[] = "COM7";
    double speed = 0.0;
    double acc = 0.0;

    char initPath[] = "";
    const int stageMode = 0;
    InitMceDll(stageMode, initPath);
    Sleep(120);

    m_main->m_stageHandle = OpenDevice(comPort);
    if (!m_main->m_stageHandle || !GetIsOpen(m_main->m_stageHandle)) {
        if (m_main->m_stageHandle) {
            CloseMotor(m_main->m_stageHandle);
            m_main->m_stageHandle = nullptr;
        }
        m_main->log(QString("Stage mode=%1 open FAILED (COM7)").arg(stageMode));
        return;
    }

    const bool okVel = GetVelocity(m_main->m_stageHandle, &speed);
    const bool okAcc = GetAccVelocity(m_main->m_stageHandle, &acc);
    if (!okVel || !okAcc) {
        m_main->log(QString("Stage mode=%1 opened, but read speed/acc FAILED").arg(stageMode));
        CloseMotor(m_main->m_stageHandle);
        m_main->m_stageHandle = nullptr;
        return;
    }

    m_main->log(QString("Stage connected (COM7), mode=%1, speed=%2, acc=%3")
        .arg(stageMode).arg(speed).arg(acc));

    if (needInit) {
        Sleep(150);

        auto backZeroWithRetry = [&](int axis) -> bool {
            if (MotorBackZero(m_main->m_stageHandle, axis)) return true;
            Sleep(220);
            return MotorBackZero(m_main->m_stageHandle, axis);
        };

        auto moveToWithRetry = [&](int axis, double value) -> bool {
            if (MotorMoveto(m_main->m_stageHandle, axis, value)) return true;
            Sleep(220);
            return MotorMoveto(m_main->m_stageHandle, axis, value);
        };

        if (!backZeroWithRetry(3)) {
            m_main->log("Stage init FAILED at XY back zero");
            CloseMotor(m_main->m_stageHandle);
            m_main->m_stageHandle = nullptr;
            return;
        }

        if (!backZeroWithRetry(4)) {
            m_main->log("Stage init FAILED at XY move to max");
            CloseMotor(m_main->m_stageHandle);
            m_main->m_stageHandle = nullptr;
            return;
        }

        double maxX = 0.0;
        double maxY = 0.0;
        if (!GetPosition(m_main->m_stageHandle, 0, maxX) || !GetPosition(m_main->m_stageHandle, 1, maxY)) {
            m_main->log("Stage init FAILED at read max range");
            CloseMotor(m_main->m_stageHandle);
            m_main->m_stageHandle = nullptr;
            return;
        }
        m_main->m_maxRangeX = maxX;
        m_main->m_maxRangeY = maxY;

        if (!moveToWithRetry(1, m_main->m_maxRangeY * 0.5)) {
            m_main->log("Stage init FAILED at move Y to center");
            CloseMotor(m_main->m_stageHandle);
            m_main->m_stageHandle = nullptr;
            return;
        }

        double centerY = 0.0;
        GetPosition(m_main->m_stageHandle, 1, centerY);

        if (!moveToWithRetry(0, m_main->m_maxRangeX * 0.5)) {
            m_main->log("Stage init FAILED at move X to center");
            CloseMotor(m_main->m_stageHandle);
            m_main->m_stageHandle = nullptr;
            return;
        }

        double centerX = 0.0;
        GetPosition(m_main->m_stageHandle, 0, centerX);

        m_main->log(QString("Stage initialized: maxX=%1, maxY=%2, centerX=%3, centerY=%4")
            .arg(m_main->m_maxRangeX).arg(m_main->m_maxRangeY).arg(centerX).arg(centerY));
    }
    else {
        m_main->log("Stage connect only (skip initialization)");
    }

    m_stageConnBtn->setEnabled(false);
    m_stageDiscBtn->setEnabled(true);
}
void ConnectDialog::onStageDisconnect()
{
    if (!m_main->m_stageHandle) {
        m_main->log("Stage not connected");
        return;
    }

    typedef bool (*Fn_CloseMotor)(void*);
    auto CloseMotor = (Fn_CloseMotor)GetProcAddress(m_main->m_hStageDll, "CloseMotor");
    if (!CloseMotor) {
        m_main->log("GetProcAddress CloseMotor FAILED");
        return;
    }

    if (CloseMotor(m_main->m_stageHandle)) {
        m_main->log("Stage disconnected");
    }
    else {
        m_main->log("Stage disconnect FAILED");
    }

    m_main->m_stageHandle = nullptr;
    m_main->m_maxRangeX = 0.0;
    m_main->m_maxRangeY = 0.0;
    m_stageConnBtn->setEnabled(true);
    m_stageDiscBtn->setEnabled(false);
}

void ConnectDialog::onMotorConnect()
{
    if (m_main->m_motorConnected) {
        m_main->log("Motor already connected");
        return;
    }

    if (!m_main->m_hMotorDll) {
        QString path = QCoreApplication::applicationDirPath() + "/zl_motor_x86.dll";
        m_main->m_hMotorDll = LoadLibraryA(path.toLocal8Bit().constData());
        if (!m_main->m_hMotorDll) {
            m_main->log("Load zl_motor_x86.dll FAILED");
            return;
        }
    }

    // 按旧930脚本 BussiNumber=23 顺序执行：
    // FunNum=4(连接) -> FunNum=2(激光器切换,0) -> FunNum=7(反射镜角度,1)
    typedef bool (*Fn_InitDll)(int&, const char*);
    typedef bool (*Fn_Connect)(char*);
    typedef bool (*Fn_SetLaserMotor)(int);
    typedef bool (*Fn_SetRefMotor)(int);
    typedef bool (*Fn_Disconnect)();

    auto InitDll = (Fn_InitDll)GetProcAddress(m_main->m_hMotorDll, "zl_InitDll");
    auto MotorConnect = (Fn_Connect)GetProcAddress(m_main->m_hMotorDll, "zl_enum_connect");
    auto SetLaserMotor = (Fn_SetLaserMotor)GetProcAddress(m_main->m_hMotorDll, "zl_set_laser_motor");
    auto SetRefMotor = (Fn_SetRefMotor)GetProcAddress(m_main->m_hMotorDll, "zl_set_ref_motor");
    auto MotorDisconnect = (Fn_Disconnect)GetProcAddress(m_main->m_hMotorDll, "zl_enum_disconnect");

    if (!InitDll || !MotorConnect || !SetLaserMotor || !SetRefMotor || !MotorDisconnect) {
        m_main->log("Motor GetProcAddress FAILED");
        return;
    }

    int nVer = 0;
    if (!InitDll(nVer, "")) {
        m_main->log("Motor InitDll FAILED");
        return;
    }

    char sn[] = "123456";
    if (!MotorConnect(sn)) {
        m_main->log("Motor connect FAILED (SN:123456)");
        return;
    }

    // FunNum=2: 控制激光器切换，旧脚本固定传0
    if (!SetLaserMotor(0)) {
        m_main->log("Motor init FAILED at set_laser_motor(0)");
        MotorDisconnect();
        return;
    }

    // FunNum=7: 设置反射镜角度，旧脚本固定传1
    if (!SetRefMotor(1)) {
        m_main->log("Motor init FAILED at set_ref_motor(1)");
        MotorDisconnect();
        return;
    }

    m_main->m_motorConnected = true;
    m_motorConnBtn->setEnabled(false);
    m_motorDiscBtn->setEnabled(true);
    m_main->log("Motor connected and initialized (SN:123456, laserMode=0, refMode=1)");
}
void ConnectDialog::onMotorDisconnect()
{
    if (!m_main->m_motorConnected) {
        m_main->log("Motor not connected");
        return;
    }

    typedef bool (*Fn_Disconnect)();
    auto MotorDisconnect = (Fn_Disconnect)GetProcAddress(m_main->m_hMotorDll, "zl_enum_disconnect");
    if (MotorDisconnect) {
        if (MotorDisconnect()) {
            m_main->log("Motor disconnected");
        } else {
            m_main->log("Motor disconnect FAILED");
        }
    } else {
        m_main->log("Motor disconnect: API not ready");
    }

    m_main->m_motorConnected = false;
    m_motorConnBtn->setEnabled(true);
    m_motorDiscBtn->setEnabled(false);
}

void ConnectDialog::onCameraConnect()
{
    if (m_main->m_cameraConnected) {
        m_main->log("Camera already connected");
        return;
    }

    if (!m_main->m_hCameraDll) {
        QString path = QCoreApplication::applicationDirPath() +
            "/zl_camera_x86.dll";
        m_main->m_hCameraDll =
            LoadLibraryA(path.toLocal8Bit().constData());
        if (!m_main->m_hCameraDll) {
            m_main->log("Load zl_camera_x86.dll FAILED");
            return;
        }
    }

    typedef void (*Fn_InitCCDDll)(int, char*);
    typedef bool (*Fn_SetImageSize)(int);
    typedef bool (*Fn_Connect)();
    typedef bool (*Fn_SetFrameSpeed)(int);
    typedef bool (*Fn_GetDevSize)(int&, int&);
    auto InitCCDDll = (Fn_InitCCDDll)GetProcAddress(m_main->m_hCameraDll,
        "InitCCDDll");
    auto SetImageSize =
        (Fn_SetImageSize)GetProcAddress(m_main->m_hCameraDll,
            "ZL_SetImageSizeMode");
    auto CamConnect = (Fn_Connect)GetProcAddress(m_main->m_hCameraDll,
        "Connect");
    auto SetFrameSpeed =
        (Fn_SetFrameSpeed)GetProcAddress(m_main->m_hCameraDll,
            "ZL_CameraSetFrameSpeed");
    auto GetDevSize = (Fn_GetDevSize)GetProcAddress(m_main->m_hCameraDll,
        "GetDevSize");

    if (!InitCCDDll || !SetImageSize || !CamConnect) {
        m_main->log("Camera GetProcAddress FAILED");
        return;
    }

    InitCCDDll(1, nullptr);       // 1 = ST500
    SetImageSize(3);              // 3 = 640x480

    if (CamConnect()) {
        if (SetFrameSpeed) SetFrameSpeed(2);
        if (GetDevSize) {
            int xSize = 0, ySize = 0;
            GetDevSize(xSize, ySize);
            m_main->log(QString("Camera sensor: %1 x% 2").arg(xSize).arg(ySize));
        }
        m_main->m_cameraConnected = true;
        m_cameraConnBtn->setEnabled(false);
        m_cameraDiscBtn->setEnabled(true);
        m_main->log("Camera (ST500) connected");
    }
    else {
        m_main->log("Camera (ST500) connect FAILED");
    }
}

void ConnectDialog::onCameraDisconnect()
{
    if (!m_main->m_cameraConnected) {
        m_main->log("Camera not connected");
        return;
    }

    typedef bool (*Fn_DisConnect)();
    auto CamDisconnect =
        (Fn_DisConnect)GetProcAddress(m_main->m_hCameraDll, "DisConnect");
    if (CamDisconnect) CamDisconnect();

    m_main->m_cameraConnected = false;
    m_cameraConnBtn->setEnabled(true);
    m_cameraDiscBtn->setEnabled(false);
    m_main->log("Camera disconnected");
}


