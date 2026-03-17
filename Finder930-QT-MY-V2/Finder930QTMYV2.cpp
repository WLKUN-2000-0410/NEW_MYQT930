#include "Finder930QTMYV2.h"
#include "ConnectDialog.h"  

Finder930QTMYV2::Finder930QTMYV2(QWidget* parent) : QMainWindow(parent)
{
    ui.setupUi(this);
    connect(ui.connectBtn, &QPushButton::clicked, this, &Finder930QTMYV2::onConnect);
}

Finder930QTMYV2::~Finder930QTMYV2()
{
    // Close spectrometer
    if (m_specHandle >= 0 && m_hSpecDll) {
        typedef bool (*Fn_spec_close)(int);
        auto specClose = (Fn_spec_close)GetProcAddress(m_hSpecDll, "spec_close");
        if (specClose) specClose(m_specHandle);
    }
    if (m_hSpecDll) { FreeLibrary(m_hSpecDll); m_hSpecDll = nullptr; }

	// Close CCD
    if (m_ccdId > 0 && m_hDfieldDll) {
        typedef void (*Fn_a4_close)();
        auto a4Close = (Fn_a4_close)GetProcAddress(m_hDfieldDll, "a4_close");
        if (a4Close) a4Close();
    }
    if (m_hDfieldDll) { FreeLibrary(m_hDfieldDll); m_hDfieldDll = nullptr; }

    // Close Laser
    if (m_laserConnected && m_hLaserDll) {
        typedef bool (*Fn_DisConnect)();
        auto LaserDisConnect = (Fn_DisConnect)GetProcAddress(m_hLaserDll, "DisConnect");
        if (LaserDisConnect) LaserDisConnect();
    }
    if (m_hLaserDll) { FreeLibrary(m_hLaserDll); m_hLaserDll = nullptr; }

    // Close Stage
    if (m_stageHandle && m_hStageDll) {
        typedef bool (*Fn_CloseMotor)(void*);
        auto CloseMotor = (Fn_CloseMotor)GetProcAddress(m_hStageDll, "CloseMotor");
        if (CloseMotor) CloseMotor(m_stageHandle);
    }
    if (m_hStageDll) { FreeLibrary(m_hStageDll); m_hStageDll = nullptr; }\

    // Close Motor
    if (m_motorConnected && m_hMotorDll) {
        typedef bool (*Fn_disconnect)();
        auto motorDisc = (Fn_disconnect)GetProcAddress(m_hMotorDll, "zl_enum_disconnect");
        if (motorDisc) motorDisc();
    }
    if (m_hMotorDll) { FreeLibrary(m_hMotorDll); m_hMotorDll = nullptr; }

    // Close Camera
    if (m_cameraConnected && m_hCameraDll) {
        typedef bool (*Fn_DisConnect)();
        auto camDisc = (Fn_DisConnect)GetProcAddress(m_hCameraDll,
            "DisConnect");
        if (camDisc) camDisc();
    }
    if (m_hCameraDll) { FreeLibrary(m_hCameraDll); m_hCameraDll = nullptr; }

}

void Finder930QTMYV2::onConnect()
{
    ConnectDialog dlg(this);
    dlg.exec();
}
void Finder930QTMYV2::log(const QString& msg)
{
    ui.logTextEdit->append(msg);
}