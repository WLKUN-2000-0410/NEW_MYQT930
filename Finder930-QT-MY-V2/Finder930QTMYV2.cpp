#include "Finder930QTMYV2.h"
#include "ConnectDialog.h"
#include "StabilityTestDialog.h"
#include "LaserTestDialog.h"
#include <QTimer>
#include <cmath>

Finder930QTMYV2::Finder930QTMYV2(QWidget* parent) : QMainWindow(parent)
{
    ui.setupUi(this);
    m_baseTitle = windowTitle();
    m_ccdTempTimer = new QTimer(this);
    m_ccdTempTimer->setInterval(1000);
    connect(m_ccdTempTimer, &QTimer::timeout, this, &Finder930QTMYV2::updateCcdTemperature);
    connect(ui.connectBtn, &QPushButton::clicked, this, &Finder930QTMYV2::onConnect);
    connect(ui.StableTest, &QPushButton::clicked, this, [this]() {
        StabilityTestDialog dlg(this);
        dlg.exec();
    });
    connect(ui.LaserTest, &QPushButton::clicked, this, [this]() {
        LaserTestDialog dlg(this);
        dlg.exec();
    });
}

Finder930QTMYV2::~Finder930QTMYV2()
{
    if (m_ccdTempTimer) {
        m_ccdTempTimer->stop();
    }

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
    if (m_hStageDll) { FreeLibrary(m_hStageDll); m_hStageDll = nullptr; }

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
        auto camDisc = (Fn_DisConnect)GetProcAddress(m_hCameraDll, "DisConnect");
        if (camDisc) camDisc();
    }
    if (m_hCameraDll) { FreeLibrary(m_hCameraDll); m_hCameraDll = nullptr; }
}

void Finder930QTMYV2::onConnect()
{
    ConnectDialog dlg(this);
    dlg.exec();
}

void Finder930QTMYV2::onCcdConnectionChanged(bool connected)
{
    if (!m_ccdTempTimer) return;

    if (connected) {
        if (!m_ccdTempTimer->isActive()) {
            m_ccdTempTimer->start();
        }
        updateCcdTemperature();
    }
    else {
        m_ccdTempTimer->stop();
        resetTitle();
    }
}

void Finder930QTMYV2::setCcdTempPollingEnabled(bool enabled)
{
    if (!m_ccdTempTimer) return;
    if (enabled) {
        if (m_ccdId > 0 && m_hDfieldDll && !m_ccdTempTimer->isActive()) {
            m_ccdTempTimer->start();
        }
    } else {
        m_ccdTempTimer->stop();
    }
}

bool Finder930QTMYV2::readCcdTemperature(double& outTempC) const
{
    if (!m_hDfieldDll || m_ccdId <= 0) return false;

    typedef bool (*Fn_GetTemperInt)(int*);
    auto getTemperInt = (Fn_GetTemperInt)GetProcAddress(m_hDfieldDll, "GetTemper");
    if (getTemperInt) {
        int temp = 0;
        if (getTemperInt(&temp) && temp > -200 && temp < 200) {
            outTempC = static_cast<double>(temp);
            return true;
        }
    }

    typedef bool (*Fn_GetTemperFloat)(float*);
    auto getTemperFloat = (Fn_GetTemperFloat)GetProcAddress(m_hDfieldDll, "GetTemper");
    if (getTemperFloat) {
        float temp = 0.0f;
        if (getTemperFloat(&temp) && std::isfinite(temp) && temp > -200.0f && temp < 200.0f) {
            outTempC = static_cast<double>(temp);
            return true;
        }
    }

    return false;
}

void Finder930QTMYV2::updateCcdTemperature()
{
    if (m_ccdId <= 0 || !m_hDfieldDll) {
        resetTitle();
        return;
    }

    double tempC = 0.0;
    if (readCcdTemperature(tempC)) {
        setWindowTitle(QString("%1 | CCD Temp: %2 C").arg(m_baseTitle).arg(tempC, 0, 'f', 1));
    }
    else {
        setWindowTitle(QString("%1 | CCD Temp: --").arg(m_baseTitle));
    }
}

void Finder930QTMYV2::resetTitle()
{
    setWindowTitle(m_baseTitle);
}

void Finder930QTMYV2::log(const QString& msg)
{
    ui.logTextEdit->append(msg);
}
