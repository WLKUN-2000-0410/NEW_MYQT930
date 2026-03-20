#include "StabilityTestDialog.h"

#include <QCheckBox>
#include <QComboBox>
#include <QCoreApplication>
#include <QFrame>
#include <QHBoxLayout>
#include <QLabel>
#include <QLineEdit>
#include <QMap>
#include <QPushButton>
#include <QSignalBlocker>
#include <QTimer>
#include <QVBoxLayout>
#include <cmath>
#include "Finder930QTMYV2.h"
#include "qcustomplot.h"

StabilityTestDialog::StabilityTestDialog(QWidget* parent)
    : QDialog(parent), m_main(qobject_cast<Finder930QTMYV2*>(parent))
{
    setWindowTitle("Stability Test");
    setModal(true);
    resize(1260, 760);

    auto* rootLayout = new QHBoxLayout(this);
    rootLayout->setContentsMargins(10, 10, 10, 10);
    rootLayout->setSpacing(10);

    auto* leftPanel = new QFrame(this);
    leftPanel->setFixedWidth(310);
    leftPanel->setStyleSheet("QFrame { background:#f7f8fa; border:1px solid #d9dce1; border-radius:6px; }");
    auto* leftLayout = new QVBoxLayout(leftPanel);
    leftLayout->setContentsMargins(12, 12, 12, 12);
    leftLayout->setSpacing(8);

    auto* title = new QLabel("Stability Test", leftPanel);
    title->setStyleSheet("QLabel{color:#222222;font-size:20px;font-weight:600;}");
    leftLayout->addWidget(title);

    auto addField = [&](const char* name, const char* val) {
        auto* lb = new QLabel(name, leftPanel);
        lb->setStyleSheet("QLabel{color:#333333;font-size:14px;}");
        auto* edit = new QLineEdit(val, leftPanel);
        edit->setReadOnly(true);
        edit->setStyleSheet("QLineEdit{background:#ffffff;color:#222222;border:1px solid #cfd3d9;border-radius:4px;padding:4px 6px;}");
        leftLayout->addWidget(lb);
        leftLayout->addWidget(edit);
    };

    auto* excLabel = new QLabel("Excitation Wave", leftPanel);
    excLabel->setStyleSheet("QLabel{color:#333333;font-size:14px;}");
    m_excCombo = new QComboBox(leftPanel);
    m_excCombo->addItems(QStringList{ "none", "532", "638", "785" });
    m_excCombo->setCurrentText("none");
    if (m_main) {
        const QString w = m_main->m_excWave;
        const QString initWave = w.contains("532") ? "532"
            : w.contains("638") ? "638"
            : w.contains("785") ? "785"
            : "none";
        m_excCombo->setCurrentText(initWave);
    }
    m_excCombo->setStyleSheet(
        "QComboBox{background:#ffffff;color:#222222;border:1px solid #cfd3d9;border-radius:4px;padding:4px 6px;}"
        "QComboBox::drop-down{border:0;}"
        "QComboBox QAbstractItemView{background:#ffffff;color:#222222;selection-background-color:#dfe8ff;}");
    leftLayout->addWidget(excLabel);
    leftLayout->addWidget(m_excCombo);

    auto* powerLabel = new QLabel("Power (mW)", leftPanel);
    powerLabel->setStyleSheet("QLabel{color:#333333;font-size:14px;}");
    m_powerCombo = new QComboBox(leftPanel);
    m_powerCombo->setStyleSheet(
        "QComboBox{background:#ffffff;color:#222222;border:1px solid #cfd3d9;border-radius:4px;padding:4px 6px;}"
        "QComboBox::drop-down{border:0;}"
        "QComboBox QAbstractItemView{background:#ffffff;color:#222222;selection-background-color:#dfe8ff;}");
    leftLayout->addWidget(powerLabel);
    leftLayout->addWidget(m_powerCombo);

    m_powerCombo->addItem(QStringLiteral("归零"));
    if (m_excCombo->currentText() == "532") {
        m_powerCombo->addItems(QStringList{ "0.1", "0.2", "0.5", "1", "2", "5", "10", "20", "50" });
    }
    else if (m_excCombo->currentText() == "638") {
        m_powerCombo->addItems(QStringList{ "0.1", "0.2", "0.5", "1", "2", "5", "10", "15", "max" });
    }
    else if (m_excCombo->currentText() == "785") {
        m_powerCombo->addItems(QStringList{ "0.1", "0.2", "0.5", "1", "2", "5", "10", "20", "max" });
    }
    m_powerCombo->setCurrentIndex(0);

    auto* pinholeLabel = new QLabel("Pinhole (um)", leftPanel);
    pinholeLabel->setStyleSheet("QLabel{color:#333333;font-size:14px;}");
    m_pinholeCombo = new QComboBox(leftPanel);
    m_pinholeCombo->setStyleSheet(
        "QComboBox{background:#ffffff;color:#222222;border:1px solid #cfd3d9;border-radius:4px;padding:4px 6px;}"
        "QComboBox::drop-down{border:0;}"
        "QComboBox QAbstractItemView{background:#ffffff;color:#222222;selection-background-color:#dfe8ff;}");
    m_pinholeCombo->addItems(QStringList{ "0", "50", "100", "200", "300", "400" });
    leftLayout->addWidget(pinholeLabel);
    leftLayout->addWidget(m_pinholeCombo);

    auto* gratingLabel = new QLabel("Grating", leftPanel);
    gratingLabel->setStyleSheet("QLabel{color:#333333;font-size:14px;}");
    m_gratingCombo = new QComboBox(leftPanel);
    m_gratingCombo->setStyleSheet(
        "QComboBox{background:#ffffff;color:#222222;border:1px solid #cfd3d9;border-radius:4px;padding:4px 6px;}"
        "QComboBox::drop-down{border:0;}"
        "QComboBox QAbstractItemView{background:#ffffff;color:#222222;selection-background-color:#dfe8ff;}");
    if (m_main && !m_main->m_gratings.isEmpty()) {
        m_gratingCombo->addItems(m_main->m_gratings);
        int idx = m_main->m_currentGrating - 1;
        if (idx >= 0 && idx < m_gratingCombo->count()) {
            m_gratingCombo->setCurrentIndex(idx);
        }
    }
    leftLayout->addWidget(gratingLabel);
    leftLayout->addWidget(m_gratingCombo);

    auto* slitLabel = new QLabel("Slit (um)", leftPanel);
    slitLabel->setStyleSheet("QLabel{color:#333333;font-size:14px;}");
    m_slitEdit = new QLineEdit("100", leftPanel);
    m_slitEdit->setStyleSheet("QLineEdit{background:#ffffff;color:#222222;border:1px solid #cfd3d9;border-radius:4px;padding:4px 6px;}");
    leftLayout->addWidget(slitLabel);
    leftLayout->addWidget(m_slitEdit);
    auto* expLabel = new QLabel("Integration (s)", leftPanel);
    expLabel->setStyleSheet("QLabel{color:#333333;font-size:14px;}");
    m_expTimeEdit = new QLineEdit("1", leftPanel);
    m_expTimeEdit->setStyleSheet("QLineEdit{background:#ffffff;color:#222222;border:1px solid #cfd3d9;border-radius:4px;padding:4px 6px;}");
    leftLayout->addWidget(expLabel);
    leftLayout->addWidget(m_expTimeEdit);
    auto* cwLabel = new QLabel("Center Wave (nm)", leftPanel);
    cwLabel->setStyleSheet("QLabel{color:#333333;font-size:14px;}");
    m_centerWaveEdit = new QLineEdit("550", leftPanel);
    m_centerWaveEdit->setStyleSheet("QLineEdit{background:#ffffff;color:#222222;border:1px solid #cfd3d9;border-radius:4px;padding:4px 6px;}");
    leftLayout->addWidget(cwLabel);
    leftLayout->addWidget(m_centerWaveEdit);
    auto* avgLabel = new QLabel("Average Count", leftPanel);
    avgLabel->setStyleSheet("QLabel{color:#333333;font-size:14px;}");
    m_avgCountEdit = new QLineEdit("1", leftPanel);
    m_avgCountEdit->setStyleSheet("QLineEdit{background:#ffffff;color:#222222;border:1px solid #cfd3d9;border-radius:4px;padding:4px 6px;}");
    leftLayout->addWidget(avgLabel);
    leftLayout->addWidget(m_avgCountEdit);

    m_intervalCheck = new QCheckBox("Interval", leftPanel);
    m_intervalCheck->setStyleSheet("QCheckBox{color:#333333;font-size:14px;}");
    m_intervalCheck->setChecked(false);
    leftLayout->addWidget(m_intervalCheck);

    auto* itLabel = new QLabel("Interval Time (s)", leftPanel);
    itLabel->setStyleSheet("QLabel{color:#333333;font-size:14px;}");
    m_intervalTimeEdit = new QLineEdit("5", leftPanel);
    m_intervalTimeEdit->setStyleSheet("QLineEdit{background:#ffffff;color:#222222;border:1px solid #cfd3d9;border-radius:4px;padding:4px 6px;}");
    leftLayout->addWidget(itLabel);
    leftLayout->addWidget(m_intervalTimeEdit);

    auto* icLabel = new QLabel("Interval Count", leftPanel);
    icLabel->setStyleSheet("QLabel{color:#333333;font-size:14px;}");
    m_intervalCountEdit = new QLineEdit("1", leftPanel);
    m_intervalCountEdit->setStyleSheet("QLineEdit{background:#ffffff;color:#222222;border:1px solid #cfd3d9;border-radius:4px;padding:4px 6px;}");
    leftLayout->addWidget(icLabel);
    leftLayout->addWidget(m_intervalCountEdit);

    leftLayout->addStretch();

    m_startBtn = new QPushButton("Start", leftPanel);
    m_startBtn->setMinimumHeight(36);
    m_startBtn->setStyleSheet("QPushButton{background:#2ea44f;color:#ffffff;border:1px solid #2c974b;border-radius:4px;font-weight:600;}"
        "QPushButton:hover{background:#2c974b;}");
    leftLayout->addWidget(m_startBtn);

    m_stopBtn = new QPushButton("Stop", leftPanel);
    m_stopBtn->setMinimumHeight(36);
    m_stopBtn->setEnabled(false);
    m_stopBtn->setStyleSheet("QPushButton{background:#da3633;color:#ffffff;border:1px solid #cf222e;border-radius:4px;font-weight:600;}"
        "QPushButton:hover{background:#cf222e;}"
        "QPushButton:disabled{background:#888888;border:1px solid #666666;}");
    leftLayout->addWidget(m_stopBtn);

    auto* closeBtn = new QPushButton("Close", leftPanel);
    closeBtn->setMinimumHeight(36);
    closeBtn->setStyleSheet("QPushButton{background:#eef1f5;color:#1f2328;border:1px solid #c5cad1;border-radius:4px;}"
        "QPushButton:hover{background:#e3e8ef;}");
    leftLayout->addWidget(closeBtn);

    m_plot = new QCustomPlot(this);
    initSpectrumPlot();

    rootLayout->addWidget(leftPanel);
    rootLayout->addWidget(m_plot, 1);

    m_lastExcWave = m_excCombo->currentText();


    connect(closeBtn, &QPushButton::clicked, this, &QDialog::accept);
    connect(m_excCombo, &QComboBox::currentTextChanged, this, &StabilityTestDialog::onExcitationWaveChanged);
    connect(m_powerCombo, &QComboBox::currentTextChanged, this, &StabilityTestDialog::onPowerChanged);
    connect(m_pinholeCombo, &QComboBox::currentTextChanged, this, &StabilityTestDialog::onPinholeChanged);
    connect(m_gratingCombo, &QComboBox::currentTextChanged, this, &StabilityTestDialog::onGratingChanged);
    connect(m_slitEdit, &QLineEdit::editingFinished, this, &StabilityTestDialog::onSlitEditFinished);
    connect(m_expTimeEdit, &QLineEdit::editingFinished, this, &StabilityTestDialog::onExpTimeEditFinished);
    connect(m_centerWaveEdit, &QLineEdit::editingFinished, this, &StabilityTestDialog::onCenterWaveEditFinished);
}

void StabilityTestDialog::onExcitationWaveChanged(const QString& waveText)
{
    // [阶段1] 保持最小映射：old 直接用缓存，new 只做一次波长归一化。
    const QString oldWave = m_lastExcWave;
    const QString newWave = waveText.contains("532") ? "532"
        : waveText.contains("638") ? "638"
        : waveText.contains("785") ? "785"
        : "none";

    static const QMap<QString, QStringList> kPowerByWave = {
        { "532", { "0.1", "0.2", "0.5", "1", "2", "5", "10", "20", "50" } },
        { "638", { "0.1", "0.2", "0.5", "1", "2", "5", "10", "15", "max" } },
        { "785", { "0.1", "0.2", "0.5", "1", "2", "5", "10", "20", "max" } }
    };
    if (m_powerCombo) {
        const QSignalBlocker blocker(m_powerCombo);
        m_powerCombo->clear();
        m_powerCombo->addItem(QStringLiteral("归零"));
        if (kPowerByWave.contains(newWave)) {
            m_powerCombo->addItems(kPowerByWave.value(newWave));
        }
        m_powerCombo->setCurrentIndex(0);
    }

    // [阶段2] 无变化直接返回，避免重复触发硬件动作。
    if (oldWave == newWave) {
        return;
    }

    // [阶段3] 先同步主窗口状态，确保 UI 与内部状态一致。
    if (m_main) {
        m_main->m_excWave = newWave;
    }

    // [阶段4] 分支1：old=none,new!=none -> 111（打开新档）
    if (m_main && oldWave == "none" && newWave != "none") {
        if (!m_main->m_laserConnected || !m_main->m_motorConnected) {
            m_main->log("BussiNumber=111 skipped: laser/motor not connected");
        }
        else {
            if (!m_main->m_hLaserDll) {
                QString path = QCoreApplication::applicationDirPath() + "/api.rtslaser_x86.dll";
                m_main->m_hLaserDll = LoadLibraryA(path.toLocal8Bit().constData());
            }
            if (!m_main->m_hMotorDll) {
                QString path = QCoreApplication::applicationDirPath() + "/zl_motor_x86.dll";
                m_main->m_hMotorDll = LoadLibraryA(path.toLocal8Bit().constData());
            }

            if (!m_main->m_hLaserDll || !m_main->m_hMotorDll) {
                m_main->log("BussiNumber=111 failed: dll load error");
            }
            else {
                typedef bool (*Fn_EnableLaser)(int, int);
                typedef bool (*Fn_SetLaserPWM)(int, int);
                typedef bool (*Fn_SetLaserMotor)(int);
                typedef bool (*Fn_SetFilter)(int, int);

                auto EnableLaser = (Fn_EnableLaser)GetProcAddress(m_main->m_hLaserDll, "EnableLaser");
                auto SetLaserPWM = (Fn_SetLaserPWM)GetProcAddress(m_main->m_hLaserDll, "SetLaserPWM");
                auto SetLaserMotor = (Fn_SetLaserMotor)GetProcAddress(m_main->m_hMotorDll, "zl_set_laser_motor");
                auto SetFilter = (Fn_SetFilter)GetProcAddress(m_main->m_hMotorDll, "zl_set_filter");

                if (!EnableLaser || !SetLaserPWM || !SetLaserMotor || !SetFilter) {
                    m_main->log("BussiNumber=111 failed: GetProcAddress missing");
                }
                else {
                    int newDevNum = -1;
                    if (newWave == "785") newDevNum = 1;
                    else if (newWave == "638") newDevNum = 2;
                    else if (newWave == "532") newDevNum = 3;

                    if (newDevNum <= 0) {
                        m_main->log("BussiNumber=111 failed: new wave mapping invalid");
                    }
                    else {
                        const int laserNewValue = newDevNum - 1;
                        const int motorNewValue = newDevNum;
                        const int filterMode = 0;

                        const bool step1 = SetLaserMotor(motorNewValue);
                        m_main->log(QString("111/step1 FunNum=2 zl_set_laser_motor(%1) => %2")
                            .arg(motorNewValue).arg(step1 ? "OK" : "FAILED"));

                        const bool step2 = EnableLaser(laserNewValue, 1);
                        m_main->log(QString("111/step2 FunNum=1 EnableLaser(mode=%1, enable=1) => %2")
                            .arg(laserNewValue).arg(step2 ? "OK" : "FAILED"));

                        const bool step3 = SetLaserPWM(laserNewValue, 0);
                        m_main->log(QString("111/step3 FunNum=8 SetLaserPWM(mode=%1, pwm=0) => %2")
                            .arg(laserNewValue).arg(step3 ? "OK" : "FAILED"));

                        const bool step4 = SetFilter(filterMode, 0);
                        m_main->log(QString("111/step4 FunNum=1 zl_set_filter(mode=%1, gear=0) => %2")
                            .arg(filterMode).arg(step4 ? "OK" : "FAILED"));

                        m_main->log(QString("BussiNumber=11 branch(old empty -> new set), execute 111 result=%1")
                            .arg((step1 && step2 && step3 && step4) ? "OK" : "FAILED"));
                    }
                }
            }
        }
    }

    // [阶段4] 分支2：old!=none,new!=none -> 100->111（先关旧，再开新）
    if (m_main && oldWave != "none" && newWave != "none") {
        if (!m_main->m_laserConnected || !m_main->m_motorConnected) {
            m_main->log("BussiNumber=100->111 skipped: laser/motor not connected");
        }
        else {
            if (!m_main->m_hLaserDll) {
                QString path = QCoreApplication::applicationDirPath() + "/api.rtslaser_x86.dll";
                m_main->m_hLaserDll = LoadLibraryA(path.toLocal8Bit().constData());
            }
            if (!m_main->m_hMotorDll) {
                QString path = QCoreApplication::applicationDirPath() + "/zl_motor_x86.dll";
                m_main->m_hMotorDll = LoadLibraryA(path.toLocal8Bit().constData());
            }

            if (!m_main->m_hLaserDll || !m_main->m_hMotorDll) {
                m_main->log("BussiNumber=100->111 failed: dll load error");
            }
            else {
                typedef bool (*Fn_EnableLaser)(int, int);
                typedef bool (*Fn_SetLaserPWM)(int, int);
                typedef bool (*Fn_SetLaserMotor)(int);
                typedef bool (*Fn_SetFilter)(int, int);

                auto EnableLaser = (Fn_EnableLaser)GetProcAddress(m_main->m_hLaserDll, "EnableLaser");
                auto SetLaserPWM = (Fn_SetLaserPWM)GetProcAddress(m_main->m_hLaserDll, "SetLaserPWM");
                auto SetLaserMotor = (Fn_SetLaserMotor)GetProcAddress(m_main->m_hMotorDll, "zl_set_laser_motor");
                auto SetFilter = (Fn_SetFilter)GetProcAddress(m_main->m_hMotorDll, "zl_set_filter");

                if (!EnableLaser || !SetLaserPWM || !SetLaserMotor || !SetFilter) {
                    m_main->log("BussiNumber=100->111 failed: GetProcAddress missing");
                }
                else {
                    int oldDevNum = 0;
                    if (oldWave == "785") oldDevNum = 1;
                    else if (oldWave == "638") oldDevNum = 2;
                    else if (oldWave == "532") oldDevNum = 3;

                    int newDevNum = -1;
                    if (newWave == "785") newDevNum = 1;
                    else if (newWave == "638") newDevNum = 2;
                    else if (newWave == "532") newDevNum = 3;

                    if (oldDevNum <= 0 || newDevNum <= 0) {
                        m_main->log("BussiNumber=100->111 failed: wave mapping invalid");
                    }
                    else {
                        const int laserOldValue = oldDevNum - 1;
                        const int laserNewValue = newDevNum - 1;
                        const int motorNewValue = newDevNum;
                        int filterMode = oldDevNum - 1;
                        if (filterMode < 0) {
                            filterMode = 0;
                        }

                        const bool c1 = EnableLaser(laserOldValue, 0);
                        m_main->log(QString("100/step1 FunNum=1 EnableLaser(mode=%1, enable=0) => %2")
                            .arg(laserOldValue).arg(c1 ? "OK" : "FAILED"));

                        const bool c2 = SetLaserPWM(laserOldValue, 0);
                        m_main->log(QString("100/step2 FunNum=8 SetLaserPWM(mode=%1, pwm=0) => %2")
                            .arg(laserOldValue).arg(c2 ? "OK" : "FAILED"));

                        const bool c3 = SetFilter(filterMode, 0);
                        m_main->log(QString("100/step3 FunNum=1 zl_set_filter(mode=%1, gear=0) => %2")
                            .arg(filterMode).arg(c3 ? "OK" : "FAILED"));

                        const bool step1 = SetLaserMotor(motorNewValue);
                        m_main->log(QString("111/step1 FunNum=2 zl_set_laser_motor(%1) => %2")
                            .arg(motorNewValue).arg(step1 ? "OK" : "FAILED"));

                        const bool step2 = EnableLaser(laserNewValue, 1);
                        m_main->log(QString("111/step2 FunNum=1 EnableLaser(mode=%1, enable=1) => %2")
                            .arg(laserNewValue).arg(step2 ? "OK" : "FAILED"));

                        const bool step3 = SetLaserPWM(laserNewValue, 0);
                        m_main->log(QString("111/step3 FunNum=8 SetLaserPWM(mode=%1, pwm=0) => %2")
                            .arg(laserNewValue).arg(step3 ? "OK" : "FAILED"));

                        const bool step4 = SetFilter(filterMode, 0);
                        m_main->log(QString("111/step4 FunNum=1 zl_set_filter(mode=%1, gear=0) => %2")
                            .arg(filterMode).arg(step4 ? "OK" : "FAILED"));

                        m_main->log(QString("BussiNumber=11 branch(old set -> new set), execute 100->111 result=%1")
                            .arg((c1 && c2 && c3 && step1 && step2 && step3 && step4) ? "OK" : "FAILED"));
                    }
                }
            }
        }
    }
    // old!=none,new=none -> 102（关旧并回空位）
    if (m_main && oldWave != "none" && newWave == "none") {
        if (!m_main->m_laserConnected || !m_main->m_motorConnected) {
            m_main->log("BussiNumber=102 skipped: laser/motor not connected");
        }
        else {
            if (!m_main->m_hLaserDll) {
                QString path = QCoreApplication::applicationDirPath() + "/api.rtslaser_x86.dll";
                m_main->m_hLaserDll = LoadLibraryA(path.toLocal8Bit().constData());
            }
            if (!m_main->m_hMotorDll) {
                QString path = QCoreApplication::applicationDirPath() + "/zl_motor_x86.dll";
                m_main->m_hMotorDll = LoadLibraryA(path.toLocal8Bit().constData());
            }

            if (!m_main->m_hLaserDll || !m_main->m_hMotorDll) {
                m_main->log("BussiNumber=102 failed: dll load error");
            }
            else {
                typedef bool (*Fn_EnableLaser)(int, int);
                typedef bool (*Fn_SetLaserPWM)(int, int);
                typedef bool (*Fn_SetLaserMotor)(int);
                typedef bool (*Fn_SetFilter)(int, int);

                auto EnableLaser = (Fn_EnableLaser)GetProcAddress(m_main->m_hLaserDll, "EnableLaser");
                auto SetLaserPWM = (Fn_SetLaserPWM)GetProcAddress(m_main->m_hLaserDll, "SetLaserPWM");
                auto SetLaserMotor = (Fn_SetLaserMotor)GetProcAddress(m_main->m_hMotorDll, "zl_set_laser_motor");
                auto SetFilter = (Fn_SetFilter)GetProcAddress(m_main->m_hMotorDll, "zl_set_filter");

                if (!EnableLaser || !SetLaserPWM || !SetLaserMotor || !SetFilter) {
                    m_main->log("BussiNumber=102 failed: GetProcAddress missing");
                }
                else {
                    int oldDevNum = 0;
                    if (oldWave == "785") oldDevNum = 1;
                    else if (oldWave == "638") oldDevNum = 2;
                    else if (oldWave == "532") oldDevNum = 3;

                    if (oldDevNum <= 0) {
                        m_main->log("BussiNumber=102 failed: old wave mapping invalid");
                    }
                    else {
                        const int laserOldValue = oldDevNum - 1;
                        int filterMode = oldDevNum - 1;
                        if (filterMode < 0) {
                            filterMode = 0;
                        }

                        const bool s1 = EnableLaser(laserOldValue, 0);
                        m_main->log(QString("102/step1 FunNum=1 EnableLaser(mode=%1, enable=0) => %2")
                            .arg(laserOldValue).arg(s1 ? "OK" : "FAILED"));

                        const bool s2 = SetLaserPWM(laserOldValue, 0);
                        m_main->log(QString("102/step2 FunNum=8 SetLaserPWM(mode=%1, pwm=0) => %2")
                            .arg(laserOldValue).arg(s2 ? "OK" : "FAILED"));

                        const bool s3 = SetFilter(filterMode, 0);
                        m_main->log(QString("102/step3 FunNum=1 zl_set_filter(mode=%1, gear=0) => %2")
                            .arg(filterMode).arg(s3 ? "OK" : "FAILED"));

                        const bool s4 = SetLaserMotor(0);
                        m_main->log(QString("102/step4 FunNum=2 zl_set_laser_motor(0) => %1")
                            .arg(s4 ? "OK" : "FAILED"));

                        m_main->log(QString("BussiNumber=11 branch(old set -> new empty), execute 102 result=%1")
                            .arg((s1 && s2 && s3 && s4) ? "OK" : "FAILED"));
                    }
                }
            }
        }
    }
    // [阶段5] 收尾：记录本次选择，作为下次 oldWave。
    m_lastExcWave = newWave;
}

void StabilityTestDialog::onPowerChanged(const QString& powerText)
{
    if (!m_main) {
        return;
    }
    if (!m_main->m_laserConnected || !m_main->m_motorConnected) {
        m_main->log("BussiNumber=12 skipped: laser/motor not connected");
        return;
    }

    QString wave = m_excCombo ? m_excCombo->currentText() : QStringLiteral("none");
    wave = wave.contains("532") ? "532"
        : wave.contains("638") ? "638"
        : wave.contains("785") ? "785"
        : "none";

    int devNum = 0;
    if (wave == "785") devNum = 1;
    else if (wave == "638") devNum = 2;
    else if (wave == "532") devNum = 3;
    if (devNum <= 0) {
        m_main->log("BussiNumber=12 skipped: current wave is none");
        return;
    }

    int powerIndex = 0;
    const QString power = powerText.trimmed();
    if (power != QStringLiteral("归零") && !power.isEmpty() && power.compare("zero", Qt::CaseInsensitive) != 0) {
        int idx = -1;
        if (wave == "532") idx = QStringList{ "0.1", "0.2", "0.5", "1", "2", "5", "10", "20", "50" }.indexOf(power);
        else if (wave == "638") idx = QStringList{ "0.1", "0.2", "0.5", "1", "2", "5", "10", "15", "max" }.indexOf(power);
        else if (wave == "785") idx = QStringList{ "0.1", "0.2", "0.5", "1", "2", "5", "10", "20", "max" }.indexOf(power);
        powerIndex = idx >= 0 ? (idx + 1) : 0;
    }

    if (!m_main->m_hLaserDll) {
        const QString laserPath = QCoreApplication::applicationDirPath() + "/api.rtslaser_x86.dll";
        m_main->m_hLaserDll = LoadLibraryA(laserPath.toLocal8Bit().constData());
    }
    if (!m_main->m_hMotorDll) {
        const QString motorPath = QCoreApplication::applicationDirPath() + "/zl_motor_x86.dll";
        m_main->m_hMotorDll = LoadLibraryA(motorPath.toLocal8Bit().constData());
    }
    if (!m_main->m_hLaserDll || !m_main->m_hMotorDll) {
        m_main->log("BussiNumber=12 failed: dll load error");
        return;
    }

    typedef bool (*Fn_SetLaserPWM)(int, int);
    typedef bool (*Fn_SetFilter)(int, int);
    auto SetLaserPWM = (Fn_SetLaserPWM)GetProcAddress(m_main->m_hLaserDll, "SetLaserPWM");
    auto SetFilter = (Fn_SetFilter)GetProcAddress(m_main->m_hMotorDll, "zl_set_filter");
    if (!SetLaserPWM || !SetFilter) {
        m_main->log("BussiNumber=12 failed: GetProcAddress missing");
        return;
    }

    const int currentLaserDevice = devNum - 1; // 0=785,1=638,2=532
    const bool step1 = SetFilter(currentLaserDevice, powerIndex);
    m_main->log(QString("12/step1 FunNum=1 zl_set_filter(device=%1, value=%2) => %3")
        .arg(currentLaserDevice).arg(powerIndex).arg(step1 ? "OK" : "FAILED"));

    const bool step2 = SetLaserPWM(currentLaserDevice, powerIndex);
    m_main->log(QString("12/step2 FunNum=8 SetLaserPWM(device=%1, value=%2) => %3")
        .arg(currentLaserDevice).arg(powerIndex).arg(step2 ? "OK" : "FAILED"));

    m_main->log(QString("BussiNumber=12 result=%1")
        .arg((step1 && step2) ? "OK" : "FAILED"));
}

void StabilityTestDialog::onPinholeChanged(const QString& pinholeText)
{
    if (!m_main) {
        return;
    }
    if (!m_main->m_motorConnected) {
        m_main->log("BussiNumber=13 skipped: motor not connected");
        return;
    }

    // 映射: "50"->1, "100"->2, "200"->3, "300"->4, "400"->5
    static const QMap<QString, int> kPinholeIndex = {
        { "50", 1 }, { "100", 2 }, { "200", 3 }, { "300", 4 }, { "400", 5 }
    };

    const int iPinholeNum = kPinholeIndex.value(pinholeText.trimmed(), 0);
    if (iPinholeNum <= 0) {
        m_main->log(QString("BussiNumber=13 skipped: unknown pinhole \"%1\"").arg(pinholeText));
        return;
    }

    if (!m_main->m_hMotorDll) {
        QString path = QCoreApplication::applicationDirPath() + "/zl_motor_x86.dll";
        m_main->m_hMotorDll = LoadLibraryA(path.toLocal8Bit().constData());
    }
    if (!m_main->m_hMotorDll) {
        m_main->log("BussiNumber=13 failed: dll load error");
        return;
    }

    typedef bool (*Fn_SetPinhole)(int);
    auto SetPinhole = (Fn_SetPinhole)GetProcAddress(m_main->m_hMotorDll, "zl_set_pinhole");
    if (!SetPinhole) {
        m_main->log("BussiNumber=13 failed: GetProcAddress zl_set_pinhole missing");
        return;
    }

    const bool ret = SetPinhole(iPinholeNum);
    m_main->log(QString("13/step1 FunNum=3 zl_set_pinhole(%1) => %2")
        .arg(iPinholeNum).arg(ret ? "OK" : "FAILED"));
}

void StabilityTestDialog::onGratingChanged(const QString& gratingText)
{
    if (!m_main) {
        return;
    }
    if (m_main->m_specHandle < 0) {
        m_main->log("FunNum=7 skipped: spectrometer not connected");
        return;
    }

    // 从 "1-G1800B500" 解析出光栅序号 1
    const int dashIdx = gratingText.indexOf('-');
    if (dashIdx <= 0) {
        m_main->log(QString("FunNum=7 skipped: invalid grating \"%1\"").arg(gratingText));
        return;
    }
    bool ok = false;
    const int gratingIndex = gratingText.left(dashIdx).toInt(&ok);
    if (!ok || gratingIndex <= 0) {
        m_main->log(QString("FunNum=7 skipped: invalid grating index \"%1\"").arg(gratingText));
        return;
    }

    if (!m_main->m_hSpecDll) {
        QString path = QCoreApplication::applicationDirPath() + "/spectrometer_x86.dll";
        m_main->m_hSpecDll = LoadLibraryA(path.toLocal8Bit().constData());
    }
    if (!m_main->m_hSpecDll) {
        m_main->log("FunNum=7 failed: dll load error");
        return;
    }

    typedef bool (*Fn_SetGrating)(int, int);
    auto SetGrating = (Fn_SetGrating)GetProcAddress(m_main->m_hSpecDll, "spec_set_grating");
    if (!SetGrating) {
        m_main->log("FunNum=7 failed: GetProcAddress spec_set_grating missing");
        return;
    }

    const bool ret = SetGrating(m_main->m_specHandle, gratingIndex);
    m_main->log(QString("FunNum=7 spec_set_grating(handle=%1, grating=%2) => %3")
        .arg(m_main->m_specHandle).arg(gratingIndex).arg(ret ? "OK" : "FAILED"));

    if (ret) {
        m_main->m_currentGrating = gratingIndex;
    }
}

void StabilityTestDialog::onSlitEditFinished()
{
    if (!m_main) {
        return;
    }
    if (m_main->m_specHandle < 0) {
        m_main->log("BussiNumber=15 skipped: spectrometer not connected");
        return;
    }
    if (m_main->m_slitIndices.isEmpty()) {
        m_main->log("BussiNumber=15 skipped: no slit installed");
        return;
    }

    bool ok = false;
    const int um = m_slitEdit->text().trimmed().toInt(&ok);
    if (!ok || um <= 0) {
        m_main->log(QString("BussiNumber=15 skipped: invalid slit value \"%1\"").arg(m_slitEdit->text()));
        return;
    }
    if (um > m_main->m_slitMaxWidth) {
        m_main->log(QString("BussiNumber=15 skipped: %1 exceeds max %2um").arg(um).arg(m_main->m_slitMaxWidth));
        m_slitEdit->setText(QString::number(m_main->m_slitMaxWidth));
        return;
    }

    if (!m_main->m_hSpecDll) {
        QString path = QCoreApplication::applicationDirPath() + "/spectrometer_x86.dll";
        m_main->m_hSpecDll = LoadLibraryA(path.toLocal8Bit().constData());
    }
    if (!m_main->m_hSpecDll) {
        m_main->log("BussiNumber=15 failed: dll load error");
        return;
    }

    typedef bool (*Fn_SetSlitWidth)(int, int, int);
    auto SetSlitWidth = (Fn_SetSlitWidth)GetProcAddress(m_main->m_hSpecDll, "spec_set_slit_width");
    if (!SetSlitWidth) {
        m_main->log("BussiNumber=15 failed: GetProcAddress spec_set_slit_width missing");
        return;
    }

    for (int slitIdx : m_main->m_slitIndices) {
        const bool ret = SetSlitWidth(m_main->m_specHandle, slitIdx, um);
        m_main->log(QString("15/FunNum=6 spec_set_slit_width(handle=%1, idx=%2, um=%3) => %4")
            .arg(m_main->m_specHandle).arg(slitIdx).arg(um).arg(ret ? "OK" : "FAILED"));
    }
}

void StabilityTestDialog::onExpTimeEditFinished()
{
    if (!m_main) {
        return;
    }
    if (m_main->m_ccdId < 0) {
        m_main->log("BussiNumber=16 skipped: CCD not connected");
        return;
    }

    bool ok = false;
    const float seconds = m_expTimeEdit->text().trimmed().toFloat(&ok);
    if (!ok || seconds <= 0) {
        m_main->log(QString("BussiNumber=16 skipped: invalid exp time \"%1\"").arg(m_expTimeEdit->text()));
        return;
    }

    if (!m_main->m_hDfieldDll) {
        QString path = QCoreApplication::applicationDirPath() + "/zl_ccd_x86.dll";
        m_main->m_hDfieldDll = LoadLibraryA(path.toLocal8Bit().constData());
    }
    if (!m_main->m_hDfieldDll) {
        m_main->log("BussiNumber=16 failed: dll load error");
        return;
    }

    typedef bool (*Fn_SetExpTime)(float);
    typedef bool (*Fn_GetExpTime)(float&);
    auto SetExpTime = (Fn_SetExpTime)GetProcAddress(m_main->m_hDfieldDll, "SetExpTime");
    auto GetExpTime = (Fn_GetExpTime)GetProcAddress(m_main->m_hDfieldDll, "GetExpTime");
    if (!SetExpTime) {
        m_main->log("BussiNumber=16 failed: GetProcAddress SetExpTime missing");
        return;
    }

    const float ms = seconds * 1000.0f;
    const bool ret = SetExpTime(ms);
    m_main->log(QString("16/FunNum=3 SetExpTime(%1ms) => %2")
        .arg(ms).arg(ret ? "OK" : "FAILED"));

    if (ret && GetExpTime) {
        float readBack = 0;
        GetExpTime(readBack);
        m_main->log(QString("16/FunNum=3 GetExpTime readback: %1ms (%2s)")
            .arg(readBack).arg(readBack / 1000.0f));
    }
}

void StabilityTestDialog::onCenterWaveEditFinished()
{
    if (!m_main) {
        return;
    }
    if (m_main->m_specHandle < 0) {
        m_main->log("BussiNumber=17 skipped: spectrometer not connected");
        return;
    }

    bool ok = false;
    const float wave = m_centerWaveEdit->text().trimmed().toFloat(&ok);
    if (!ok || wave <= 0) {
        m_main->log(QString("BussiNumber=17 skipped: invalid center wave \"%1\"").arg(m_centerWaveEdit->text()));
        return;
    }

    if (!m_main->m_hSpecDll) {
        QString path = QCoreApplication::applicationDirPath() + "/spectrometer_x86.dll";
        m_main->m_hSpecDll = LoadLibraryA(path.toLocal8Bit().constData());
    }
    if (!m_main->m_hSpecDll) {
        m_main->log("BussiNumber=17 failed: dll load error");
        return;
    }

    typedef bool (*Fn_MoveToWave)(int, float);
    auto MoveToWave = (Fn_MoveToWave)GetProcAddress(m_main->m_hSpecDll, "spec_move_to_wave");
    if (!MoveToWave) {
        m_main->log("BussiNumber=17 failed: GetProcAddress spec_move_to_wave missing");
        return;
    }

    const bool ret = MoveToWave(m_main->m_specHandle, wave);
    m_main->log(QString("17/FunNum=1 spec_move_to_wave(handle=%1, wave=%2) => %3")
        .arg(m_main->m_specHandle).arg(wave).arg(ret ? "OK" : "FAILED"));
}

void StabilityTestDialog::initSpectrumPlot()
{
    if (!m_plot) return;

    m_plot->setBackground(QColor(255, 255, 255));
    m_plot->legend->setVisible(false);
    m_plot->setInteractions(QCP::iRangeDrag | QCP::iRangeZoom);

    QPen axisPen(QColor(55, 55, 55));
    m_plot->xAxis->setBasePen(axisPen);
    m_plot->yAxis->setBasePen(axisPen);
    m_plot->xAxis->setTickPen(axisPen);
    m_plot->yAxis->setTickPen(axisPen);
    m_plot->xAxis->setSubTickPen(QPen(QColor(120, 120, 120)));
    m_plot->yAxis->setSubTickPen(QPen(QColor(120, 120, 120)));
    m_plot->xAxis->setTickLabelColor(QColor(40, 40, 40));
    m_plot->yAxis->setTickLabelColor(QColor(40, 40, 40));
    m_plot->xAxis->setLabelColor(QColor(20, 20, 20));
    m_plot->yAxis->setLabelColor(QColor(20, 20, 20));
    m_plot->xAxis->grid()->setPen(QPen(QColor(210, 210, 210), 1, Qt::DotLine));
    m_plot->yAxis->grid()->setPen(QPen(QColor(210, 210, 210), 1, Qt::DotLine));
    m_plot->xAxis->grid()->setSubGridVisible(false);
    m_plot->yAxis->grid()->setSubGridVisible(false);

    m_plot->xAxis->setLabel("Wavelength (nm)");
    m_plot->yAxis->setLabel("Intensity");

    auto* graph = m_plot->addGraph();
    graph->setPen(QPen(QColor(31, 119, 180), 1.6));

    QVector<double> xData;
    QVector<double> yData;
    xData.reserve(1200);
    yData.reserve(1200);

    for (int i = 0; i < 1200; ++i) {
        const double x = 400.0 + i * (500.0 / 1199.0);
        const double p1 = 5.5 * std::exp(-std::pow((x - 532.0) / 8.0, 2.0));
        const double p2 = 2.3 * std::exp(-std::pow((x - 610.0) / 16.0, 2.0));
        const double p3 = 1.7 * std::exp(-std::pow((x - 720.0) / 22.0, 2.0));
        const double base = 0.25 + 0.08 * std::sin(x * 0.05);
        xData.push_back(x);
        yData.push_back(base + p1 + p2 + p3);
    }

    graph->setData(xData, yData);
    m_plot->xAxis->setRange(400.0, 900.0);
    m_plot->yAxis->setRange(0.0, 10.0);
    m_plot->replot();
}

