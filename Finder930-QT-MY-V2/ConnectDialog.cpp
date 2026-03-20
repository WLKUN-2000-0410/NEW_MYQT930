#include "ConnectDialog.h"
#include "Finder930QTMYV2.h"
#include <QGridLayout>
#include <QPushButton>
#include <QLabel>
#include <QCoreApplication>
#include <QMessageBox>
#include <vector>

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
    if (m_main->m_specHandle >= 0) {
        m_main->log("Spectrometer already connected");
        return;
    }

    if (!m_main->m_hSpecDll) {
        QString path = QCoreApplication::applicationDirPath() + "/spectrometer_x86.dll";
        m_main->m_hSpecDll = LoadLibraryA(path.toLocal8Bit().constData());
        if (!m_main->m_hSpecDll) {
            m_main->log("Spectrometer DLL load FAILED");
            return;
        }
    }

    // 1) 谱仪初始化用到的最小接口集合（按旧930连接脚本顺序）
    typedef int (*Fn_spec_open)(const char*);
    typedef bool (*Fn_spec_close)(int);
    typedef bool (*Fn_spec_is_setup_shutter)(int, int, bool*);
    typedef bool (*Fn_spec_get_shutter_status)(int, int, bool*);
    typedef bool (*Fn_spec_is_setup_mirror)(int, int, bool*);
    typedef bool (*Fn_spec_get_entrance_port)(int, bool*);
    typedef bool (*Fn_spec_set_ccd_mode)(int, bool);
    typedef bool (*Fn_spec_get_grating_count)(int, short*);
    typedef bool (*Fn_spec_get_grating_info)(int, int, int*, long*);
    typedef bool (*Fn_spec_get_grating)(int, int*);
    typedef bool (*Fn_spec_get_max_wavelength)(int, int, float*);
    typedef bool (*Fn_spec_move_to_wave)(int, float);
    typedef bool (*Fn_spec_is_setup_slit)(int, int, bool*);
    typedef bool (*Fn_spec_set_slit_width)(int, int, int);

    auto specOpen = (Fn_spec_open)GetProcAddress(m_main->m_hSpecDll, "spec_open");
    auto specClose = (Fn_spec_close)GetProcAddress(m_main->m_hSpecDll, "spec_close");
    auto isSetupShutter = (Fn_spec_is_setup_shutter)GetProcAddress(m_main->m_hSpecDll, "spec_is_setup_shutter");
    auto getShutterStatus = (Fn_spec_get_shutter_status)GetProcAddress(m_main->m_hSpecDll, "spec_get_shutter_status");
    auto isSetupMirror = (Fn_spec_is_setup_mirror)GetProcAddress(m_main->m_hSpecDll, "spec_is_setup_mirror");
    auto getEntrancePort = (Fn_spec_get_entrance_port)GetProcAddress(m_main->m_hSpecDll, "spec_get_entrance_port");
    auto setCcdMode = (Fn_spec_set_ccd_mode)GetProcAddress(m_main->m_hSpecDll, "spec_set_ccd_mode");
    auto getGratingCount = (Fn_spec_get_grating_count)GetProcAddress(m_main->m_hSpecDll, "spec_get_grating_count");
    auto getGratingInfo = (Fn_spec_get_grating_info)GetProcAddress(m_main->m_hSpecDll, "spec_get_grating_info");
    auto getGrating = (Fn_spec_get_grating)GetProcAddress(m_main->m_hSpecDll, "spec_get_grating");
    auto getMaxWavelength = (Fn_spec_get_max_wavelength)GetProcAddress(m_main->m_hSpecDll, "spec_get_max_wavelength");
    auto moveToWave = (Fn_spec_move_to_wave)GetProcAddress(m_main->m_hSpecDll, "spec_move_to_wave");
    auto isSetupSlit = (Fn_spec_is_setup_slit)GetProcAddress(m_main->m_hSpecDll, "spec_is_setup_slit");
    auto setSlitWidth = (Fn_spec_set_slit_width)GetProcAddress(m_main->m_hSpecDll, "spec_set_slit_width");

    if (!specOpen || !specClose || !isSetupShutter || !getShutterStatus || !isSetupMirror ||
        !getEntrancePort || !setCcdMode || !getGratingCount || !getGratingInfo || !getGrating ||
        !getMaxWavelength || !moveToWave || !isSetupSlit || !setSlitWidth) {
        m_main->log("Spectrometer GetProcAddress FAILED");
        return;
    }

    // 打印当前实际加载DLL路径，便于确认运行环境
    char dllPath[MAX_PATH] = { 0 };
    if (GetModuleFileNameA(m_main->m_hSpecDll, dllPath, MAX_PATH) > 0) {
        m_main->log(QString("Spectrometer DLL loaded: %1").arg(QString::fromLocal8Bit(dllPath)));
    }

    // 2) 连接谱仪（旧软件设备选择：SR-5801）
    m_main->m_specHandle = specOpen("SR-5801");
    if (m_main->m_specHandle < 0) {
        m_main->log("Spectrometer open FAILED");
        return;
    }
    m_main->log("Spectrometer connected (SR-5801)");

    // 3) 初始化流程（复刻旧930 BussiNumber=19的关键动作）
    bool initOk = true;

    // 3.1 查询快门安装（0~3），并读取已安装快门状态
    std::vector<int> shutters;
    for (int idx = 0; idx <= 3; ++idx) {
        bool installed = false;
        if (isSetupShutter(m_main->m_specHandle, idx, &installed) && installed) {
            shutters.push_back(idx);
        }
    }
    for (int idx : shutters) {
        bool opened = false;
        if (getShutterStatus(m_main->m_specHandle, idx, &opened)) {
            m_main->log(QString("Shutter idx=%1 status=%2").arg(idx).arg(opened ? "OPEN" : "CLOSE"));
        }
    }
    if (shutters.empty()) {
        m_main->log("Shutter query OK: installed=0");
    }

    // 3.2 查询摆镜安装（旧脚本固定查0、1），读取当前入口直/侧
    std::vector<int> mirrors;
    for (int idx = 0; idx <= 1; ++idx) {
        bool installed = false;
        if (isSetupMirror(m_main->m_specHandle, idx, &installed) && installed) {
            mirrors.push_back(idx);
        }
    }
    if (!mirrors.empty()) {
        bool entranceIsSide = false;
        if (getEntrancePort(m_main->m_specHandle, &entranceIsSide)) {
            m_main->log(QString("Mirror entrance port: %1").arg(entranceIsSide ? "SIDE" : "STRAIGHT"));
        }
    }
    else {
        m_main->log("Mirror query OK: installed=0");
    }

    // 3.3 设置谱仪为CCD搭配模式（失败重试一次）
    if (!(setCcdMode(m_main->m_specHandle, true) || (Sleep(120), setCcdMode(m_main->m_specHandle, true)))) {
        initOk = false;
        m_main->log("Spectrometer init FAILED at set_ccd_mode(true)");
    }
    else {
        m_main->log("Spectrometer set_ccd_mode(true) SUCCESS");
    }

    // 3.4 读取光栅信息 -> 当前光栅 -> 当前光栅最大波长
    short gratingCount = 0;
    if (getGratingCount(m_main->m_specHandle, &gratingCount) && gratingCount > 0) {
        m_main->log(QString("Spectrometer get_grating_count SUCCESS: %1").arg(gratingCount));
        for (int g = 1; g <= gratingCount; ++g) {
            int groove = 0;
            long blaze = 0;
            if (getGratingInfo(m_main->m_specHandle, g, &groove, &blaze)) {
                m_main->log(QString("Grating %1: groove=%2, blaze=%3").arg(g).arg(groove).arg(blaze));
            }
        }
    }
    else {
        initOk = false;
        m_main->log("Spectrometer init FAILED at get_grating_count");
    }

    int currentGrating = 0;
    if (!getGrating(m_main->m_specHandle, &currentGrating) || currentGrating <= 0) {
        initOk = false;
        m_main->log("Spectrometer init FAILED at get_grating");
    }
    else {
        m_main->log(QString("Spectrometer get_grating SUCCESS: %1").arg(currentGrating));
    }

    float maxWave = 0.0f;
    if (currentGrating > 0) {
        if (!getMaxWavelength(m_main->m_specHandle, currentGrating, &maxWave) || maxWave <= 0.0f) {
            initOk = false;
            m_main->log("Spectrometer init FAILED at get_max_wavelength");
        }
        else {
            m_main->log(QString("Spectrometer get_max_wavelength SUCCESS: %1").arg(maxWave));
        }
    }

    // 3.5 单色仪绝对移动（旧逻辑是移到配置中心波长；这里用 maxWave*0.5 作为稳妥默认）
    float centerWave = (maxWave > 1.0f) ? (maxWave * 0.5f) : 532.0f;
    if (!(moveToWave(m_main->m_specHandle, centerWave) || (Sleep(150), moveToWave(m_main->m_specHandle, centerWave)))) {
        initOk = false;
        m_main->log("Spectrometer init FAILED at move_to_wave");
    }
    else {
        m_main->log(QString("Spectrometer move_to_wave SUCCESS: %1").arg(centerWave));
    }

    // 3.6 查询狭缝安装（0~3），已安装狭缝设置默认宽度
    std::vector<int> slits;
    for (int idx = 0; idx <= 3; ++idx) {
        bool installed = false;
        if (isSetupSlit(m_main->m_specHandle, idx, &installed) && installed) {
            slits.push_back(idx);
        }
    }
    const int defaultSlitWidthUm = 100;
    for (int idx : slits) {
        if (!(setSlitWidth(m_main->m_specHandle, idx, defaultSlitWidthUm) ||
            (Sleep(100), setSlitWidth(m_main->m_specHandle, idx, defaultSlitWidthUm)))) {
            initOk = false;
            m_main->log(QString("Spectrometer slit init FAILED at idx=%1").arg(idx));
        }
        else {
            m_main->log(QString("Spectrometer set_slit_width SUCCESS: idx=%1, width=%2um")
                .arg(idx).arg(defaultSlitWidthUm));
        }
    }
    if (slits.empty()) {
        m_main->log("Slit query OK: installed=0");
    }

    if (!initOk) {
        specClose(m_main->m_specHandle);
        m_main->m_specHandle = -1;
        m_main->log("Spectrometer connect FAILED (init not complete)");
    }
    else {
        m_specConnBtn->setEnabled(false);
        m_specDiscBtn->setEnabled(true);
        m_main->log(QString("Spectrometer initialized: grating=%1, maxWave=%2, centerWave=%3, slits=%4")
            .arg(currentGrating).arg(maxWave).arg(centerWave).arg(slits.size()));
    }
}

void ConnectDialog::onSpecDisconnect()
{
    if (m_main->m_specHandle < 0) {
        m_main->log("Spectrometer not connected");
        return;
    }

    typedef bool (*Fn_spec_close)(int);
    auto specClose = (Fn_spec_close)GetProcAddress(m_main->m_hSpecDll, "spec_close");
    if (specClose) {
        if (!specClose(m_main->m_specHandle)) {
            m_main->log("Spectrometer close FAILED");
        }
    }
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
