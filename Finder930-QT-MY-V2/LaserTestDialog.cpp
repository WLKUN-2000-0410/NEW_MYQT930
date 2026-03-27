#include "LaserTestDialog.h"
#include "Finder930QTMYV2.h"

#include <QComboBox>
#include <QCoreApplication>
#include <QDateTime>
#include <QFrame>
#include <QGridLayout>
#include <QGroupBox>
#include <QHBoxLayout>
#include <QLabel>
#include <QLineEdit>
#include <QPushButton>
#include <QTextEdit>
#include <QVBoxLayout>
#include <limits>

namespace {
template <typename T>
T resolveApi(HMODULE dll, const char* name)
{
    return reinterpret_cast<T>(GetProcAddress(dll, name));
}
}

LaserTestDialog::LaserTestDialog(QWidget* parent)
    : QDialog(parent), m_main(qobject_cast<Finder930QTMYV2*>(parent))
{
    setWindowTitle("LaserTest - V2 Motor API");
    resize(980, 760);
    setMinimumSize(900, 680);

    auto* root = new QVBoxLayout(this);
    root->setContentsMargins(12, 12, 12, 12);
    root->setSpacing(10);

    auto* title = new QLabel("LaserTest (UI Draft)", this);
    title->setStyleSheet("QLabel{font-size:20px;font-weight:600;color:#1f2328;}");
    root->addWidget(title);

    auto* desc = new QLabel(
        "V2 API test panel. Click buttons to send commands and check return values.",
        this);
    desc->setStyleSheet("QLabel{font-size:13px;color:#57606a;}");
    root->addWidget(desc);

    auto* targetCard = new QFrame(this);
    targetCard->setStyleSheet("QFrame{background:#f6f8fa;border:1px solid #d0d7de;border-radius:6px;}");
    auto* targetLayout = new QHBoxLayout(targetCard);
    targetLayout->setContentsMargins(10, 8, 10, 8);
    targetLayout->setSpacing(8);
    targetLayout->addWidget(new QLabel("Target Motor ID (1-4):", targetCard));
    m_motorIdCombo = new QComboBox(targetCard);
    m_motorIdCombo->setObjectName("motorIdCombo");
    m_motorIdCombo->addItems(QStringList{ "1", "2", "3", "4" });
    targetLayout->addWidget(m_motorIdCombo);
    targetLayout->addStretch();
    root->addWidget(targetCard);

    auto* mainGrid = new QGridLayout();
    mainGrid->setHorizontalSpacing(10);
    mainGrid->setVerticalSpacing(10);

    auto* totalBox = new QGroupBox("Total Steps (SetTotalStepsV2 / GetTotalStepsV2)", this);
    auto* totalLayout = new QGridLayout(totalBox);
    totalLayout->addWidget(new QLabel("Input Total Steps (0-4294967295):", totalBox), 0, 0);
    m_totalStepsInput = new QLineEdit("0", totalBox);
    m_totalStepsInput->setObjectName("totalStepsInput");
    totalLayout->addWidget(m_totalStepsInput, 0, 1);
    m_setTotalStepsBtn = new QPushButton("SetTotalStepsV2", totalBox);
    m_setTotalStepsBtn->setObjectName("setTotalStepsBtn");
    totalLayout->addWidget(m_setTotalStepsBtn, 1, 0);
    m_getTotalStepsBtn = new QPushButton("GetTotalStepsV2", totalBox);
    m_getTotalStepsBtn->setObjectName("getTotalStepsBtn");
    totalLayout->addWidget(m_getTotalStepsBtn, 1, 1);
    totalLayout->addWidget(new QLabel("Readback Total Steps:", totalBox), 2, 0);
    m_totalStepsReadback = new QLineEdit(totalBox);
    m_totalStepsReadback->setObjectName("totalStepsReadback");
    m_totalStepsReadback->setReadOnly(true);
    m_totalStepsReadback->setPlaceholderText("Readback value...");
    totalLayout->addWidget(m_totalStepsReadback, 2, 1);

    auto* minSpeedBox = new QGroupBox("Min Speed (SetMinSpeedV2 / GetMinSpeedV2)", this);
    auto* minLayout = new QGridLayout(minSpeedBox);
    minLayout->addWidget(new QLabel("Input Min Speed (100-20000 PPS):", minSpeedBox), 0, 0);
    m_minSpeedInput = new QLineEdit("100", minSpeedBox);
    m_minSpeedInput->setObjectName("minSpeedInput");
    minLayout->addWidget(m_minSpeedInput, 0, 1);
    m_setMinSpeedBtn = new QPushButton("SetMinSpeedV2", minSpeedBox);
    m_setMinSpeedBtn->setObjectName("setMinSpeedBtn");
    minLayout->addWidget(m_setMinSpeedBtn, 1, 0);
    m_getMinSpeedBtn = new QPushButton("GetMinSpeedV2", minSpeedBox);
    m_getMinSpeedBtn->setObjectName("getMinSpeedBtn");
    minLayout->addWidget(m_getMinSpeedBtn, 1, 1);
    minLayout->addWidget(new QLabel("Readback Min Speed:", minSpeedBox), 2, 0);
    m_minSpeedReadback = new QLineEdit(minSpeedBox);
    m_minSpeedReadback->setObjectName("minSpeedReadback");
    m_minSpeedReadback->setReadOnly(true);
    m_minSpeedReadback->setPlaceholderText("Readback value...");
    minLayout->addWidget(m_minSpeedReadback, 2, 1);

    auto* maxSpeedBox = new QGroupBox("Max Speed (SetMaxSpeedV2 / GetMaxSpeedV2)", this);
    auto* maxLayout = new QGridLayout(maxSpeedBox);
    maxLayout->addWidget(new QLabel("Input Max Speed:", maxSpeedBox), 0, 0);
    m_maxSpeedInput = new QLineEdit("1000", maxSpeedBox);
    m_maxSpeedInput->setObjectName("maxSpeedInput");
    maxLayout->addWidget(m_maxSpeedInput, 0, 1);
    m_setMaxSpeedBtn = new QPushButton("SetMaxSpeedV2", maxSpeedBox);
    m_setMaxSpeedBtn->setObjectName("setMaxSpeedBtn");
    maxLayout->addWidget(m_setMaxSpeedBtn, 1, 0);
    m_getMaxSpeedBtn = new QPushButton("GetMaxSpeedV2", maxSpeedBox);
    m_getMaxSpeedBtn->setObjectName("getMaxSpeedBtn");
    maxLayout->addWidget(m_getMaxSpeedBtn, 1, 1);
    maxLayout->addWidget(new QLabel("Readback Max Speed:", maxSpeedBox), 2, 0);
    m_maxSpeedReadback = new QLineEdit(maxSpeedBox);
    m_maxSpeedReadback->setObjectName("maxSpeedReadback");
    m_maxSpeedReadback->setReadOnly(true);
    m_maxSpeedReadback->setPlaceholderText("Readback value...");
    maxLayout->addWidget(m_maxSpeedReadback, 2, 1);

    auto* posBox = new QGroupBox("Position (GetPosV2)", this);
    auto* posLayout = new QGridLayout(posBox);
    m_getPosBtn = new QPushButton("GetPosV2", posBox);
    m_getPosBtn->setObjectName("getPosBtn");
    posLayout->addWidget(m_getPosBtn, 0, 0, 1, 2);
    posLayout->addWidget(new QLabel("Readback Pos:", posBox), 1, 0);
    m_posReadback = new QLineEdit(posBox);
    m_posReadback->setObjectName("posReadback");
    m_posReadback->setReadOnly(true);
    m_posReadback->setPlaceholderText("nPos");
    posLayout->addWidget(m_posReadback, 1, 1);
    posLayout->addWidget(new QLabel("Readback Step:", posBox), 2, 0);
    m_stepReadback = new QLineEdit(posBox);
    m_stepReadback->setObjectName("stepReadback");
    m_stepReadback->setReadOnly(true);
    m_stepReadback->setPlaceholderText("nStep");
    posLayout->addWidget(m_stepReadback, 2, 1);

    auto* debugBox = new QGroupBox("Debug Step (SetDebugStepV2)", this);
    auto* debugLayout = new QGridLayout(debugBox);
    debugLayout->addWidget(new QLabel("Input Absolute Step:", debugBox), 0, 0);
    m_debugStepInput = new QLineEdit("0", debugBox);
    m_debugStepInput->setObjectName("debugStepInput");
    debugLayout->addWidget(m_debugStepInput, 0, 1);
    m_setDebugStepBtn = new QPushButton("SetDebugStepV2", debugBox);
    m_setDebugStepBtn->setObjectName("setDebugStepBtn");
    debugLayout->addWidget(m_setDebugStepBtn, 1, 0, 1, 2);

    auto* homeBox = new QGroupBox("Home (ToHomeV2)", this);
    auto* homeLayout = new QGridLayout(homeBox);
    m_toHomeBtn = new QPushButton("ToHomeV2", homeBox);
    m_toHomeBtn->setObjectName("toHomeBtn");
    m_toHomeBtn->setMinimumHeight(34);
    homeLayout->addWidget(m_toHomeBtn, 0, 0);
    auto* homeHint = new QLabel("Send motor home command for selected motor ID.", homeBox);
    homeHint->setWordWrap(true);
    homeHint->setStyleSheet("QLabel{color:#57606a;}");
    homeLayout->addWidget(homeHint, 1, 0);

    mainGrid->addWidget(totalBox, 0, 0);
    mainGrid->addWidget(minSpeedBox, 0, 1);
    mainGrid->addWidget(maxSpeedBox, 1, 0);
    mainGrid->addWidget(posBox, 1, 1);
    mainGrid->addWidget(debugBox, 2, 0);
    mainGrid->addWidget(homeBox, 2, 1);

    root->addLayout(mainGrid);

    auto* logTitle = new QLabel("Action Log (UI Preview)", this);
    logTitle->setStyleSheet("QLabel{font-size:13px;font-weight:600;color:#1f2328;}");
    root->addWidget(logTitle);

    m_hintLog = new QTextEdit(this);
    m_hintLog->setObjectName("hintLog");
    m_hintLog->setReadOnly(true);
    m_hintLog->setMinimumHeight(120);
    m_hintLog->setPlainText("LaserTest log ready.");
    root->addWidget(m_hintLog);

    connect(m_setTotalStepsBtn, &QPushButton::clicked, this, &LaserTestDialog::onSetTotalStepsClicked);
    connect(m_getTotalStepsBtn, &QPushButton::clicked, this, &LaserTestDialog::onGetTotalStepsClicked);
    connect(m_setMinSpeedBtn, &QPushButton::clicked, this, &LaserTestDialog::onSetMinSpeedClicked);
    connect(m_getMinSpeedBtn, &QPushButton::clicked, this, &LaserTestDialog::onGetMinSpeedClicked);
    connect(m_setMaxSpeedBtn, &QPushButton::clicked, this, &LaserTestDialog::onSetMaxSpeedClicked);
    connect(m_getMaxSpeedBtn, &QPushButton::clicked, this, &LaserTestDialog::onGetMaxSpeedClicked);
    connect(m_toHomeBtn, &QPushButton::clicked, this, &LaserTestDialog::onToHomeClicked);
    connect(m_getPosBtn, &QPushButton::clicked, this, &LaserTestDialog::onGetPosClicked);
    connect(m_setDebugStepBtn, &QPushButton::clicked, this, &LaserTestDialog::onSetDebugStepClicked);

    appendLog("Ready. Please connect Laser first in the Connect dialog.");
}

void LaserTestDialog::appendLog(const QString& msg)
{
    if (!m_hintLog) return;
    const QString ts = QDateTime::currentDateTime().toString("HH:mm:ss.zzz");
    m_hintLog->append(QString("[%1] %2").arg(ts, msg));
}

int LaserTestDialog::currentMotorId() const
{
    if (!m_motorIdCombo) return -1;
    bool ok = false;
    const int motorId = m_motorIdCombo->currentText().trimmed().toInt(&ok);
    if (!ok || motorId < 1 || motorId > 4) return -1;
    return motorId;
}

bool LaserTestDialog::ensureLaserApiReady()
{
    if (!m_main) {
        appendLog("ERROR: main window context not found.");
        return false;
    }

    if (!m_main->m_hLaserDll) {
        const QString path = QCoreApplication::applicationDirPath() + "/api.rtslaser_x86.dll";
        m_main->m_hLaserDll = LoadLibraryA(path.toLocal8Bit().constData());
        if (!m_main->m_hLaserDll) {
            appendLog(QString("ERROR: LoadLibrary failed: %1").arg(path));
            return false;
        }
        appendLog(QString("DLL loaded: %1").arg(path));
    }

    if (!m_main->m_laserConnected) {
        appendLog("ERROR: laser is not connected. Please click Connect -> Laser first.");
        return false;
    }
    return true;
}

void LaserTestDialog::onSetTotalStepsClicked()
{
    if (!ensureLaserApiReady()) return;

    const int motorId = currentMotorId();
    if (motorId < 0) {
        appendLog("ERROR: invalid motor id.");
        return;
    }

    bool ok = false;
    const qulonglong value = m_totalStepsInput->text().trimmed().toULongLong(&ok);
    if (!ok || value > (std::numeric_limits<unsigned int>::max)()) {
        appendLog("ERROR: total steps must be in range 0-4294967295.");
        return;
    }

    typedef bool (*Fn_SetTotalStepsV2)(int, unsigned int);
    auto fn = resolveApi<Fn_SetTotalStepsV2>(m_main->m_hLaserDll, "SetTotalStepsV2");
    if (!fn) {
        appendLog("ERROR: GetProcAddress(SetTotalStepsV2) failed.");
        return;
    }

    appendLog(QString("TX> MOTOR_TOTALSTEPS %1 %2").arg(motorId).arg(value));
    const bool ret = fn(motorId, static_cast<unsigned int>(value));
    appendLog(QString("RX< SetTotalStepsV2 => %1").arg(ret ? "OK" : "FAILED"));
}

void LaserTestDialog::onGetTotalStepsClicked()
{
    if (!ensureLaserApiReady()) return;

    const int motorId = currentMotorId();
    if (motorId < 0) {
        appendLog("ERROR: invalid motor id.");
        return;
    }

    typedef bool (*Fn_GetTotalStepsV2)(int, int&);
    auto fn = resolveApi<Fn_GetTotalStepsV2>(m_main->m_hLaserDll, "GetTotalStepsV2");
    if (!fn) {
        appendLog("ERROR: GetProcAddress(GetTotalStepsV2) failed.");
        return;
    }

    int step = 0;
    appendLog(QString("TX> MOTOR_TOTALSTEPS? %1").arg(motorId));
    const bool ret = fn(motorId, step);
    appendLog(QString("RX< GetTotalStepsV2 => %1, nStep=%2").arg(ret ? "OK" : "FAILED").arg(step));
    if (ret && m_totalStepsReadback) {
        m_totalStepsReadback->setText(QString::number(step));
    }
}

void LaserTestDialog::onSetMinSpeedClicked()
{
    if (!ensureLaserApiReady()) return;

    const int motorId = currentMotorId();
    if (motorId < 0) {
        appendLog("ERROR: invalid motor id.");
        return;
    }

    bool ok = false;
    const int speed = m_minSpeedInput->text().trimmed().toInt(&ok);
    if (!ok || speed < 100 || speed > 20000) {
        appendLog("ERROR: min speed must be in range 100-20000.");
        return;
    }

    typedef bool (*Fn_SetMinSpeedV2)(int, int);
    auto fn = resolveApi<Fn_SetMinSpeedV2>(m_main->m_hLaserDll, "SetMinSpeedV2");
    if (!fn) {
        appendLog("ERROR: GetProcAddress(SetMinSpeedV2) failed.");
        return;
    }

    appendLog(QString("TX> MOTORSTARTSPEED %1 %2").arg(motorId).arg(speed));
    const bool ret = fn(motorId, speed);
    appendLog(QString("RX< SetMinSpeedV2 => %1").arg(ret ? "OK" : "FAILED"));
}

void LaserTestDialog::onGetMinSpeedClicked()
{
    if (!ensureLaserApiReady()) return;

    const int motorId = currentMotorId();
    if (motorId < 0) {
        appendLog("ERROR: invalid motor id.");
        return;
    }

    typedef bool (*Fn_GetMinSpeedV2)(int, int&);
    auto fn = resolveApi<Fn_GetMinSpeedV2>(m_main->m_hLaserDll, "GetMinSpeedV2");
    if (!fn) {
        appendLog("ERROR: GetProcAddress(GetMinSpeedV2) failed.");
        return;
    }

    int speed = 0;
    appendLog(QString("TX> MOTORSTARTSPEED? %1").arg(motorId));
    const bool ret = fn(motorId, speed);
    appendLog(QString("RX< GetMinSpeedV2 => %1, nSpeed=%2").arg(ret ? "OK" : "FAILED").arg(speed));
    if (ret && m_minSpeedReadback) {
        m_minSpeedReadback->setText(QString::number(speed));
    }
}

void LaserTestDialog::onSetMaxSpeedClicked()
{
    if (!ensureLaserApiReady()) return;

    const int motorId = currentMotorId();
    if (motorId < 0) {
        appendLog("ERROR: invalid motor id.");
        return;
    }

    bool ok = false;
    const int speed = m_maxSpeedInput->text().trimmed().toInt(&ok);
    if (!ok || speed <= 0) {
        appendLog("ERROR: max speed must be a positive integer.");
        return;
    }

    typedef bool (*Fn_SetMaxSpeedV2)(int, int);
    auto fn = resolveApi<Fn_SetMaxSpeedV2>(m_main->m_hLaserDll, "SetMaxSpeedV2");
    if (!fn) {
        appendLog("ERROR: GetProcAddress(SetMaxSpeedV2) failed.");
        return;
    }

    appendLog(QString("TX> MOTORSPEED %1 %2").arg(motorId).arg(speed));
    const bool ret = fn(motorId, speed);
    appendLog(QString("RX< SetMaxSpeedV2 => %1").arg(ret ? "OK" : "FAILED"));
}

void LaserTestDialog::onGetMaxSpeedClicked()
{
    if (!ensureLaserApiReady()) return;

    const int motorId = currentMotorId();
    if (motorId < 0) {
        appendLog("ERROR: invalid motor id.");
        return;
    }

    typedef bool (*Fn_GetMaxSpeedV2)(int, int&);
    auto fn = resolveApi<Fn_GetMaxSpeedV2>(m_main->m_hLaserDll, "GetMaxSpeedV2");
    if (!fn) {
        appendLog("ERROR: GetProcAddress(GetMaxSpeedV2) failed.");
        return;
    }

    int speed = 0;
    appendLog(QString("TX> MOTORSPEED? %1").arg(motorId));
    const bool ret = fn(motorId, speed);
    appendLog(QString("RX< GetMaxSpeedV2 => %1, nSpeed=%2").arg(ret ? "OK" : "FAILED").arg(speed));
    if (ret && m_maxSpeedReadback) {
        m_maxSpeedReadback->setText(QString::number(speed));
    }
}

void LaserTestDialog::onToHomeClicked()
{
    if (!ensureLaserApiReady()) return;

    const int motorId = currentMotorId();
    if (motorId < 0) {
        appendLog("ERROR: invalid motor id.");
        return;
    }

    typedef bool (*Fn_ToHomeV2)(int);
    auto fn = resolveApi<Fn_ToHomeV2>(m_main->m_hLaserDll, "ToHomeV2");
    if (!fn) {
        appendLog("ERROR: GetProcAddress(ToHomeV2) failed.");
        return;
    }

    appendLog(QString("TX> MOTORHOME %1").arg(motorId));
    const bool ret = fn(motorId);
    appendLog(QString("RX< ToHomeV2 => %1").arg(ret ? "OK" : "FAILED"));
}

void LaserTestDialog::onGetPosClicked()
{
    if (!ensureLaserApiReady()) return;

    const int motorId = currentMotorId();
    if (motorId < 0) {
        appendLog("ERROR: invalid motor id.");
        return;
    }

    typedef bool (*Fn_GetPosV2)(int, int&, int&);
    auto fn = resolveApi<Fn_GetPosV2>(m_main->m_hLaserDll, "GetPosV2");
    if (!fn) {
        appendLog("ERROR: GetProcAddress(GetPosV2) failed.");
        return;
    }

    int pos = 0;
    int step = 0;
    appendLog(QString("TX> NOWPOS_STEP? %1").arg(motorId));
    const bool ret = fn(motorId, pos, step);
    appendLog(QString("RX< GetPosV2 => %1, nPos=%2, nStep=%3").arg(ret ? "OK" : "FAILED").arg(pos).arg(step));
    if (ret) {
        if (m_posReadback) m_posReadback->setText(QString::number(pos));
        if (m_stepReadback) m_stepReadback->setText(QString::number(step));
    }
}

void LaserTestDialog::onSetDebugStepClicked()
{
    if (!ensureLaserApiReady()) return;

    const int motorId = currentMotorId();
    if (motorId < 0) {
        appendLog("ERROR: invalid motor id.");
        return;
    }

    bool ok = false;
    const int step = m_debugStepInput->text().trimmed().toInt(&ok);
    if (!ok || step < 0) {
        appendLog("ERROR: debug step must be a non-negative integer.");
        return;
    }

    typedef bool (*Fn_SetDebugStepV2)(int, int);
    auto fn = resolveApi<Fn_SetDebugStepV2>(m_main->m_hLaserDll, "SetDebugStepV2");
    if (!fn) {
        appendLog("ERROR: GetProcAddress(SetDebugStepV2) failed.");
        return;
    }

    appendLog(QString("TX> MOTOR %1 %2").arg(motorId).arg(step));
    const bool ret = fn(motorId, step);
    appendLog(QString("RX< SetDebugStepV2 => %1").arg(ret ? "OK" : "FAILED"));
}
