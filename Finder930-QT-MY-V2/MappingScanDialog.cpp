#include "MappingScanDialog.h"
#include "Finder930QTMYV2.h"
#include "qcustomplot.h"

#include <QCheckBox>
#include <QComboBox>
#include <QCoreApplication>
#include <QDateTime>
#include <QDir>
#include <QFile>
#include <QGridLayout>
#include <QHBoxLayout>
#include <QGroupBox>
#include <QLabel>
#include <QLineEdit>
#include <QPushButton>
#include <QSpacerItem>
#include <QStackedWidget>
#include <QTextEdit>
#include <QVBoxLayout>
#include <cmath>

namespace {
QString zh(const wchar_t* text)
{
    return QString::fromWCharArray(text);
}

HMODULE g_mappingDll = nullptr;
HMODULE g_mappingFileDll = nullptr;
}

MappingScanDialog::MappingScanDialog(QWidget* parent)
    : QDialog(parent), m_main(qobject_cast<Finder930QTMYV2*>(parent))
{
    setWindowTitle("Mapping Scan");
    resize(1460, 920);
    setMinimumSize(1320, 840);

    setStyleSheet(
        "QDialog { background-color: #2f2f2f; color: #f2f2f2; }"
        "QGroupBox { border: 1px solid #5a5a5a; margin-top: 16px; "
        "           font-size: 15px; font-weight: 700; color: #f5f5f5; }"
        "QGroupBox::title { subcontrol-origin: margin; left: 12px; padding: 0 8px; }"
        "QLabel { color: #f0f0f0; font-size: 15px; }"
        "QCheckBox { color: #f0f0f0; }"
        "QCheckBox::indicator { width: 18px; height: 18px; }"
        "QLineEdit { background: #2b2b2b; border: 1px solid #5d5d5d; border-radius: 8px; "
        "            min-height: 34px; color: #f8f8f8; font-size: 15px; padding: 0 10px; }"
        "QPushButton { background: #77818c; color: #f8f8f8; border-radius: 6px; "
        "              min-height: 34px; font-size: 15px; border: 1px solid #818b96; }");

    auto* root = new QHBoxLayout(this);
    root->setContentsMargins(16, 16, 16, 16);
    root->setSpacing(12);

    auto* leftPanel = new QWidget(this);
    leftPanel->setMinimumWidth(430);
    leftPanel->setMaximumWidth(500);
    auto* leftLayout = new QVBoxLayout(leftPanel);
    leftLayout->setContentsMargins(0, 0, 0, 0);
    leftLayout->setSpacing(12);

    auto* specGroup = new QGroupBox(zh(L"\u5149\u8c31\u53c2\u6570"), this);
    auto* grid = new QGridLayout();
    grid->setContentsMargins(16, 12, 16, 14);
    grid->setHorizontalSpacing(10);
    grid->setVerticalSpacing(8);
    specGroup->setLayout(grid);

    auto* centerLabel = new QLabel(zh(L"\u4e2d\u5fc3\u6ce2\u957f:"), specGroup);
    centerLabel->setMinimumWidth(86);
    m_centerWaveEdit = new QLineEdit(specGroup);
    m_centerWaveEdit->setObjectName("centerWaveEdit");
    m_centerWaveEdit->setMinimumHeight(34);
    auto* centerUnit = new QLabel("nm", specGroup);

    auto* intLabel = new QLabel(zh(L"\u79ef\u5206\u65f6\u95f4:"), specGroup);
    intLabel->setMinimumWidth(86);
    m_integrationTimeEdit = new QLineEdit(specGroup);
    m_integrationTimeEdit->setObjectName("integrationTimeEdit");
    m_integrationTimeEdit->setMinimumHeight(34);
    auto* intUnit = new QLabel("s", specGroup);

    auto* slitLabel = new QLabel(zh(L"\u72ed\u7f1d:"), specGroup);
    slitLabel->setMinimumWidth(86);
    m_slitEdit = new QLineEdit(specGroup);
    m_slitEdit->setObjectName("slitEdit");
    m_slitEdit->setMinimumHeight(34);
    auto* slitUnit = new QLabel("um", specGroup);

    auto* avgLabel = new QLabel(zh(L"\u5e73\u5747\u6b21\u6570:"), specGroup);
    avgLabel->setMinimumWidth(86);
    m_avgCountEdit = new QLineEdit(specGroup);
    m_avgCountEdit->setObjectName("avgCountEdit");
    m_avgCountEdit->setMinimumHeight(34);
    auto* avgUnit = new QLabel("", specGroup);

    grid->addWidget(centerLabel, 0, 0);
    grid->addWidget(m_centerWaveEdit, 0, 1);
    grid->addWidget(centerUnit, 0, 2);

    grid->addWidget(intLabel, 1, 0);
    grid->addWidget(m_integrationTimeEdit, 1, 1);
    grid->addWidget(intUnit, 1, 2);

    grid->addWidget(slitLabel, 2, 0);
    grid->addWidget(m_slitEdit, 2, 1);
    grid->addWidget(slitUnit, 2, 2);

    grid->addWidget(avgLabel, 3, 0);
    grid->addWidget(m_avgCountEdit, 3, 1);
    grid->addWidget(avgUnit, 3, 2);

    grid->setColumnStretch(1, 1);

    leftLayout->addWidget(specGroup);

    auto* scanGroup = new QGroupBox(zh(L"\u626b\u63cf\u533a\u57df"), this);
    auto* scanGrid = new QGridLayout();
    scanGrid->setContentsMargins(14, 12, 14, 14);
    scanGrid->setHorizontalSpacing(8);
    scanGrid->setVerticalSpacing(14);
    scanGroup->setLayout(scanGrid);

    auto* centerTitle = new QLabel(zh(L"\u4e2d\u5fc3\u70b9"), scanGroup);
    auto* lengthTitle = new QLabel(zh(L"\u957f\u5ea6"), scanGroup);
    auto* stepTitle = new QLabel(zh(L"\u6b65\u8ddd"), scanGroup);
    centerTitle->setAlignment(Qt::AlignCenter);
    lengthTitle->setAlignment(Qt::AlignCenter);
    stepTitle->setAlignment(Qt::AlignCenter);

    scanGrid->addWidget(centerTitle, 0, 2);
    scanGrid->addWidget(lengthTitle, 0, 3);
    scanGrid->addWidget(stepTitle, 0, 4);

    m_xAxisCheck = new QCheckBox(scanGroup);
    m_xAxisCheck->setChecked(true);
    auto* xLabel = new QLabel("X:", scanGroup);
    m_xCenterEdit = new QLineEdit("1", scanGroup);
    m_xLengthEdit = new QLineEdit("1", scanGroup);
    m_xStepEdit = new QLineEdit("1", scanGroup);
    m_xCenterEdit->setMinimumHeight(34);
    m_xLengthEdit->setMinimumHeight(34);
    m_xStepEdit->setMinimumHeight(34);
    auto* xUnit = new QLabel("um", scanGroup);

    m_yAxisCheck = new QCheckBox(scanGroup);
    m_yAxisCheck->setChecked(true);
    auto* yLabel = new QLabel("Y:", scanGroup);
    m_yCenterEdit = new QLineEdit("1", scanGroup);
    m_yLengthEdit = new QLineEdit("1", scanGroup);
    m_yStepEdit = new QLineEdit("1", scanGroup);
    m_yCenterEdit->setMinimumHeight(34);
    m_yLengthEdit->setMinimumHeight(34);
    m_yStepEdit->setMinimumHeight(34);
    auto* yUnit = new QLabel("um", scanGroup);

    m_zAxisCheck = new QCheckBox(scanGroup);
    m_zAxisCheck->setChecked(false);
    auto* zLabel = new QLabel("Z:", scanGroup);
    m_zCenterEdit = new QLineEdit("1", scanGroup);
    m_zLengthEdit = new QLineEdit("1", scanGroup);
    m_zStepEdit = new QLineEdit("1", scanGroup);
    m_zCenterEdit->setMinimumHeight(34);
    m_zLengthEdit->setMinimumHeight(34);
    m_zStepEdit->setMinimumHeight(34);
    auto* zUnit = new QLabel("um", scanGroup);

    scanGrid->addWidget(m_xAxisCheck, 1, 0, Qt::AlignCenter);
    scanGrid->addWidget(xLabel, 1, 1);
    scanGrid->addWidget(m_xCenterEdit, 1, 2);
    scanGrid->addWidget(m_xLengthEdit, 1, 3);
    scanGrid->addWidget(m_xStepEdit, 1, 4);
    scanGrid->addWidget(xUnit, 1, 5);

    scanGrid->addWidget(m_yAxisCheck, 2, 0, Qt::AlignCenter);
    scanGrid->addWidget(yLabel, 2, 1);
    scanGrid->addWidget(m_yCenterEdit, 2, 2);
    scanGrid->addWidget(m_yLengthEdit, 2, 3);
    scanGrid->addWidget(m_yStepEdit, 2, 4);
    scanGrid->addWidget(yUnit, 2, 5);

    scanGrid->addWidget(m_zAxisCheck, 3, 0, Qt::AlignCenter);
    scanGrid->addWidget(zLabel, 3, 1);
    scanGrid->addWidget(m_zCenterEdit, 3, 2);
    scanGrid->addWidget(m_zLengthEdit, 3, 3);
    scanGrid->addWidget(m_zStepEdit, 3, 4);
    scanGrid->addWidget(zUnit, 3, 5);

    auto* scanSpacer = new QSpacerItem(0, 10, QSizePolicy::Minimum, QSizePolicy::Fixed);
    scanGrid->addItem(scanSpacer, 4, 0, 1, 6);

    m_readCenterBtn = new QPushButton(zh(L"\u8bfb\u53d6\u4e2d\u5fc3\u70b9"), scanGroup);
    m_readCenterBtn->setMinimumHeight(36);
    scanGrid->addWidget(m_readCenterBtn, 5, 2, 1, 3);

    m_startBtn = new QPushButton("Start", scanGroup);
    m_stopBtn = new QPushButton("Stop", scanGroup);
    m_stopBtn->setEnabled(false);
    m_startBtn->setMinimumHeight(36);
    m_stopBtn->setMinimumHeight(36);
    auto* startStopRow = new QHBoxLayout();
    startStopRow->setContentsMargins(0, 0, 0, 0);
    startStopRow->setSpacing(8);
    startStopRow->addWidget(m_startBtn);
    startStopRow->addWidget(m_stopBtn);
    scanGrid->addLayout(startStopRow, 6, 2, 1, 3);

    scanGrid->setColumnStretch(2, 1);
    scanGrid->setColumnStretch(3, 1);
    scanGrid->setColumnStretch(4, 1);

    auto* displayGroup = new QGroupBox(zh(L"\u663e\u793a\u53c2\u6570"), this);
    displayGroup->setMinimumHeight(140);
    displayGroup->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Fixed);
    auto* displayLayout = new QVBoxLayout(displayGroup);
    displayLayout->setContentsMargins(14, 12, 14, 14);
    displayLayout->setSpacing(6);

    m_displayTypeCombo = new QComboBox(displayGroup);
    m_displayTypeCombo->addItem(zh(L"\u5355\u6ce2\u957f\u5f3a\u5ea6"));
    m_displayTypeCombo->addItem(zh(L"\u79ef\u5206\u9ad8\u5ea6"));
    m_displayTypeCombo->addItem(zh(L"\u5cf0\u503c\u6ce2\u957f"));
    m_displayTypeCombo->addItem(zh(L"\u534a\u9ad8\u5bbd"));
    m_displayTypeCombo->setMinimumHeight(36);
    displayLayout->addWidget(m_displayTypeCombo);

    m_displayParamStack = new QStackedWidget(displayGroup);
    m_displayParamStack->setSizePolicy(QSizePolicy::Preferred, QSizePolicy::Fixed);

    auto* singlePage = new QWidget(m_displayParamStack);
    auto* singleRow = new QHBoxLayout(singlePage);
    singleRow->setContentsMargins(0, 0, 0, 0);
    singleRow->setSpacing(8);
    m_singleNmEdit = new QLineEdit("0.00", singlePage);
    m_singleNmEdit->setMinimumHeight(34);
    auto* singleUnit = new QLabel("nm", singlePage);
    singleRow->addStretch();
    singleRow->addWidget(m_singleNmEdit, 1);
    singleRow->addWidget(singleUnit);

    auto* integralPage = new QWidget(m_displayParamStack);
    auto* integralRow = new QHBoxLayout(integralPage);
    integralRow->setContentsMargins(0, 0, 0, 0);
    integralRow->setSpacing(8);
    m_integralNmStartEdit = new QLineEdit("0.00", integralPage);
    m_integralNmEndEdit = new QLineEdit("0.00", integralPage);
    m_integralNmStartEdit->setMinimumHeight(34);
    m_integralNmEndEdit->setMinimumHeight(34);
    auto* integralUnit = new QLabel("nm", integralPage);
    integralRow->addStretch();
    integralRow->addWidget(m_integralNmStartEdit, 1);
    integralRow->addWidget(m_integralNmEndEdit, 1);
    integralRow->addWidget(integralUnit);

    auto* peakPage = new QWidget(m_displayParamStack);
    peakPage->setMinimumHeight(2);

    auto* fwhmPage = new QWidget(m_displayParamStack);
    auto* fwhmRow = new QHBoxLayout(fwhmPage);
    fwhmRow->setContentsMargins(0, 0, 0, 0);
    fwhmRow->setSpacing(8);
    m_fwhmNmLeftEdit = new QLineEdit("0.00", fwhmPage);
    m_fwhmNmRightEdit = new QLineEdit("0.00", fwhmPage);
    m_fwhmNmLeftEdit->setMinimumHeight(34);
    m_fwhmNmRightEdit->setMinimumHeight(34);
    auto* fwhmUnit = new QLabel("nm", fwhmPage);
    fwhmRow->addStretch();
    fwhmRow->addWidget(m_fwhmNmLeftEdit, 1);
    fwhmRow->addWidget(m_fwhmNmRightEdit, 1);
    fwhmRow->addWidget(fwhmUnit);

        m_displayParamStack->addWidget(singlePage);   // 0 閸楁洘灏濋梹鍨繁鎼?
    m_displayParamStack->addWidget(integralPage); // 1 缁夘垰鍨庢妯哄
    m_displayParamStack->addWidget(peakPage);     // 2 瀹勬澘鈧吋灏濋梹?
    m_displayParamStack->addWidget(fwhmPage);     // 3 閸楀﹪鐝€?
    displayLayout->addWidget(m_displayParamStack);
    displayLayout->addStretch();

    leftLayout->addWidget(displayGroup);
    leftLayout->addWidget(scanGroup);

    auto* logGroup = new QGroupBox("Log", this);
    auto* logLayout = new QVBoxLayout(logGroup);
    logLayout->setContentsMargins(12, 12, 12, 12);
    m_logEdit = new QTextEdit(logGroup);
    m_logEdit->setReadOnly(true);
    m_logEdit->setMinimumHeight(180);
    logLayout->addWidget(m_logEdit);
    leftLayout->addWidget(logGroup, 1);

    auto* heatmapGroup = new QGroupBox(zh(L"\u70ed\u529b\u56fe"), this);
    auto* heatmapLayout = new QVBoxLayout(heatmapGroup);
    heatmapLayout->setContentsMargins(12, 12, 12, 12);
    heatmapLayout->setSpacing(8);

    m_heatmapPlot = new QCustomPlot(heatmapGroup);
    m_heatmapPlot->setMinimumSize(700, 620);
    heatmapLayout->addWidget(m_heatmapPlot, 1);

    m_heatmapPlot->plotLayout()->clear();
    auto* axisRect = new QCPAxisRect(m_heatmapPlot);
    m_heatmapColorScale = new QCPColorScale(m_heatmapPlot);
    m_heatmapPlot->plotLayout()->addElement(0, 0, axisRect);
    m_heatmapPlot->plotLayout()->addElement(0, 1, m_heatmapColorScale);
    m_heatmapPlot->plotLayout()->setColumnStretchFactor(0, 20);
    m_heatmapPlot->plotLayout()->setColumnStretchFactor(1, 1);

    m_heatmapPlot->setBackground(QColor(20, 20, 20));
    axisRect->setBackground(QColor(28, 28, 28));
    axisRect->axis(QCPAxis::atBottom)->setLabelColor(Qt::white);
    axisRect->axis(QCPAxis::atLeft)->setLabelColor(Qt::white);
    axisRect->axis(QCPAxis::atBottom)->setTickLabelColor(Qt::white);
    axisRect->axis(QCPAxis::atLeft)->setTickLabelColor(Qt::white);
    axisRect->axis(QCPAxis::atBottom)->setBasePen(QPen(Qt::white));
    axisRect->axis(QCPAxis::atLeft)->setBasePen(QPen(Qt::white));
    axisRect->axis(QCPAxis::atBottom)->setTickPen(QPen(Qt::white));
    axisRect->axis(QCPAxis::atLeft)->setTickPen(QPen(Qt::white));
    axisRect->axis(QCPAxis::atBottom)->setSubTickPen(QPen(Qt::white));
    axisRect->axis(QCPAxis::atLeft)->setSubTickPen(QPen(Qt::white));
    axisRect->axis(QCPAxis::atBottom)->setLabel("X");
    axisRect->axis(QCPAxis::atLeft)->setLabel("Y");
    axisRect->axis(QCPAxis::atBottom)->grid()->setVisible(false);
    axisRect->axis(QCPAxis::atLeft)->grid()->setVisible(false);

    m_heatmapColorScale->setType(QCPAxis::atRight);
    m_heatmapColorScale->axis()->setTickLabelColor(Qt::white);
    m_heatmapColorScale->axis()->setBasePen(QPen(Qt::white));
    m_heatmapColorScale->axis()->setTickPen(QPen(Qt::white));
    m_heatmapColorScale->axis()->setSubTickPen(QPen(Qt::white));

    m_heatmapColorMap = new QCPColorMap(axisRect->axis(QCPAxis::atBottom), axisRect->axis(QCPAxis::atLeft));
    m_heatmapColorMap->setColorScale(m_heatmapColorScale);
    m_heatmapColorMap->setGradient(QCPColorGradient::gpJet);
    m_heatmapColorMap->setInterpolate(false);
    m_heatmapColorMap->data()->setSize(11, 11);
    m_heatmapColorMap->data()->setRange(QCPRange(1, 11), QCPRange(1, 11));
    for (int x = 0; x < 11; ++x) {
        for (int y = 0; y < 11; ++y) {
            m_heatmapColorMap->data()->setCell(x, y, 0.0);
        }
    }
    m_heatmapColorMap->setDataRange(QCPRange(0.0, 1.0));
    axisRect->axis(QCPAxis::atBottom)->setRange(1, 11);
    axisRect->axis(QCPAxis::atLeft)->setRange(1, 11);
    m_heatmapPlot->replot();

    root->addWidget(leftPanel, 0);
    root->addWidget(heatmapGroup, 1);

    connect(m_centerWaveEdit, &QLineEdit::editingFinished, this, &MappingScanDialog::onCenterWaveEditFinished);
    connect(m_integrationTimeEdit, &QLineEdit::editingFinished, this, &MappingScanDialog::onIntegrationTimeEditFinished);
    connect(m_slitEdit, &QLineEdit::editingFinished, this, &MappingScanDialog::onSlitEditFinished);
    connect(m_readCenterBtn, &QPushButton::clicked, this, &MappingScanDialog::onReadCenterPointClicked);
    connect(m_startBtn, &QPushButton::clicked, this, &MappingScanDialog::onStartClicked);
    connect(m_stopBtn, &QPushButton::clicked, this, &MappingScanDialog::onStopClicked);
    connect(m_displayTypeCombo, static_cast<void(QComboBox::*)(int)>(&QComboBox::currentIndexChanged), this, &MappingScanDialog::onDisplayModeChanged);

    onDisplayModeChanged(m_displayTypeCombo ? m_displayTypeCombo->currentIndex() : 0);
}

void MappingScanDialog::onDisplayModeChanged(int index)
{
    if (!m_displayParamStack) {
        return;
    }
    if (index < 0 || index >= m_displayParamStack->count()) {
        index = 0;
    }
    m_displayParamStack->setCurrentIndex(index);
}

void MappingScanDialog::mapLog(const QString& msg)
{
    if (m_logEdit) {
        m_logEdit->append(msg);
    }
}

void MappingScanDialog::onSlitEditFinished()
{
    if (!m_main) {
        return;
    }
    if (m_main->m_specHandle < 0) {
        mapLog("BussiNumber=15 skipped: spectrometer not connected");
        return;
    }
    if (m_main->m_slitIndices.isEmpty()) {
        mapLog("BussiNumber=15 skipped: no slit installed");
        return;
    }

    bool ok = false;
    const int um = m_slitEdit->text().trimmed().toInt(&ok);
    if (!ok || um <= 0) {
        mapLog(QString("BussiNumber=15 skipped: invalid slit value \"%1\"").arg(m_slitEdit->text()));
        return;
    }
    if (um > m_main->m_slitMaxWidth) {
        mapLog(QString("BussiNumber=15 skipped: %1 exceeds max %2um").arg(um).arg(m_main->m_slitMaxWidth));
        m_slitEdit->setText(QString::number(m_main->m_slitMaxWidth));
        return;
    }

    if (!m_main->m_hSpecDll) {
        QString path = QCoreApplication::applicationDirPath() + "/spectrometer_x86.dll";
        m_main->m_hSpecDll = LoadLibraryA(path.toLocal8Bit().constData());
    }
    if (!m_main->m_hSpecDll) {
        mapLog("BussiNumber=15 failed: dll load error");
        return;
    }

    typedef bool (*Fn_SetSlitWidth)(int, int, int);
    auto SetSlitWidth = (Fn_SetSlitWidth)GetProcAddress(m_main->m_hSpecDll, "spec_set_slit_width");
    if (!SetSlitWidth) {
        mapLog("BussiNumber=15 failed: GetProcAddress spec_set_slit_width missing");
        return;
    }

    for (int slitIdx : m_main->m_slitIndices) {
        const bool ret = SetSlitWidth(m_main->m_specHandle, slitIdx, um);
        mapLog(QString("15/FunNum=6 spec_set_slit_width(handle=%1, idx=%2, um=%3) => %4")
            .arg(m_main->m_specHandle).arg(slitIdx).arg(um).arg(ret ? "OK" : "FAILED"));
    }
}

void MappingScanDialog::onIntegrationTimeEditFinished()
{
    if (!m_main) {
        return;
    }
    if (m_main->m_ccdId < 0) {
        mapLog("BussiNumber=16 skipped: CCD not connected");
        return;
    }

    bool ok = false;
    const float seconds = m_integrationTimeEdit->text().trimmed().toFloat(&ok);
    if (!ok || seconds <= 0) {
        mapLog(QString("BussiNumber=16 skipped: invalid exp time \"%1\"").arg(m_integrationTimeEdit->text()));
        return;
    }

    if (!m_main->m_hDfieldDll) {
        QString path = QCoreApplication::applicationDirPath() + "/zl_ccd_x86.dll";
        m_main->m_hDfieldDll = LoadLibraryA(path.toLocal8Bit().constData());
    }
    if (!m_main->m_hDfieldDll) {
        mapLog("BussiNumber=16 failed: dll load error");
        return;
    }

    typedef bool (*Fn_SetExpTime)(float);
    typedef bool (*Fn_GetExpTime)(float&);
    auto SetExpTime = (Fn_SetExpTime)GetProcAddress(m_main->m_hDfieldDll, "SetExpTime");
    auto GetExpTime = (Fn_GetExpTime)GetProcAddress(m_main->m_hDfieldDll, "GetExpTime");
    if (!SetExpTime) {
        mapLog("BussiNumber=16 failed: GetProcAddress SetExpTime missing");
        return;
    }

    const float ms = seconds * 1000.0f;
    const bool ret = SetExpTime(ms);
    mapLog(QString("16/FunNum=3 SetExpTime(%1ms) => %2")
        .arg(ms).arg(ret ? "OK" : "FAILED"));

    if (ret && GetExpTime) {
        float readBack = 0;
        GetExpTime(readBack);
        mapLog(QString("16/FunNum=3 GetExpTime readback: %1ms (%2s)")
            .arg(readBack).arg(readBack / 1000.0f));
    }
}

void MappingScanDialog::onCenterWaveEditFinished()
{
    if (!m_main) {
        return;
    }
    if (m_main->m_specHandle < 0) {
        mapLog("BussiNumber=17 skipped: spectrometer not connected");
        return;
    }

    bool ok = false;
    const float wave = m_centerWaveEdit->text().trimmed().toFloat(&ok);
    if (!ok || wave <= 0) {
        mapLog(QString("BussiNumber=17 skipped: invalid center wave \"%1\"").arg(m_centerWaveEdit->text()));
        return;
    }

    if (!m_main->m_hSpecDll) {
        QString path = QCoreApplication::applicationDirPath() + "/spectrometer_x86.dll";
        m_main->m_hSpecDll = LoadLibraryA(path.toLocal8Bit().constData());
    }
    if (!m_main->m_hSpecDll) {
        mapLog("BussiNumber=17 failed: dll load error");
        return;
    }

    typedef bool (*Fn_MoveToWave)(int, float);
    auto MoveToWave = (Fn_MoveToWave)GetProcAddress(m_main->m_hSpecDll, "spec_move_to_wave");
    if (!MoveToWave) {
        mapLog("BussiNumber=17 failed: GetProcAddress spec_move_to_wave missing");
        return;
    }

    const bool ret = MoveToWave(m_main->m_specHandle, wave);
    mapLog(QString("17/FunNum=1 spec_move_to_wave(handle=%1, wave=%2) => %3")
        .arg(m_main->m_specHandle).arg(wave).arg(ret ? "OK" : "FAILED"));
}

void MappingScanDialog::onReadCenterPointClicked()
{
    if (!m_main) {
        return;
    }
    if (!m_main->m_stageHandle || !m_main->m_hStageDll) {
        mapLog("BussiNumber=43 skipped: stage not connected");
        return;
    }

    typedef bool (*Fn_GetPosition)(void*, int, double&);
    auto GetPosition = (Fn_GetPosition)GetProcAddress(m_main->m_hStageDll, "GetPosition");
    if (!GetPosition) {
        mapLog("BussiNumber=43 failed: GetProcAddress GetPosition missing");
        return;
    }

    bool readAny = false;

    if (m_xAxisCheck && m_xAxisCheck->isChecked()) {
        double pos = 0.0;
        const bool ok = GetPosition(m_main->m_stageHandle, 0, pos);
        mapLog(QString("43/FunNum=3 GetPosition(axis=0) => %1, pos=%2")
            .arg(ok ? "OK" : "FAILED").arg(pos));
        if (ok && m_xCenterEdit) {
            m_xCenterEdit->setText(QString::number(pos, 'f', 3));
            readAny = true;
        }
    }

    if (m_yAxisCheck && m_yAxisCheck->isChecked()) {
        double pos = 0.0;
        const bool ok = GetPosition(m_main->m_stageHandle, 1, pos);
        mapLog(QString("43/FunNum=3 GetPosition(axis=1) => %1, pos=%2")
            .arg(ok ? "OK" : "FAILED").arg(pos));
        if (ok && m_yCenterEdit) {
            m_yCenterEdit->setText(QString::number(pos, 'f', 3));
            readAny = true;
        }
    }

    if (m_zAxisCheck && m_zAxisCheck->isChecked()) {
        double pos = 0.0;
        const bool ok = GetPosition(m_main->m_stageHandle, 2, pos);
        const double uiPos = pos / 10.0; // aligned with old program Rev_MCEGetPosition z-axis scaling
        mapLog(QString("43/FunNum=3 GetPosition(axis=2) => %1, rawPos=%2, uiPos=%3")
            .arg(ok ? "OK" : "FAILED").arg(pos).arg(uiPos));
        if (ok && m_zCenterEdit) {
            m_zCenterEdit->setText(QString::number(uiPos, 'f', 3));
            readAny = true;
        }
    }

    if (!readAny) {
        mapLog("BussiNumber=43 skipped: no axis selected");
    }
}

void MappingScanDialog::onStartClicked()
{
    if (!m_main) {
        return;
    }

    m_runCtxValid = false;
    m_initXWaves.clear();
    m_initXPixels = 0;
    m_runCtx = MappingRunContext();

    bool ok = false;
    const float centerWave = m_centerWaveEdit ? m_centerWaveEdit->text().trimmed().toFloat(&ok) : 0.0f;
    if (!ok || centerWave <= 0.0f) {
        mapLog(QString("M1/ERR invalid centerWave: \"%1\"").arg(m_centerWaveEdit ? m_centerWaveEdit->text() : ""));
        return;
    }

    ok = false;
    const float expSec = m_integrationTimeEdit ? m_integrationTimeEdit->text().trimmed().toFloat(&ok) : 0.0f;
    if (!ok || expSec <= 0.0f) {
        mapLog(QString("M1/ERR invalid expTime: \"%1\"").arg(m_integrationTimeEdit ? m_integrationTimeEdit->text() : ""));
        return;
    }

    ok = false;
    const int slitUm = m_slitEdit ? m_slitEdit->text().trimmed().toInt(&ok) : 0;
    if (!ok || slitUm <= 0) {
        mapLog(QString("M1/ERR invalid slit: \"%1\"").arg(m_slitEdit ? m_slitEdit->text() : ""));
        return;
    }

    ok = false;
    const int avgCount = m_avgCountEdit ? m_avgCountEdit->text().trimmed().toInt(&ok) : 0;
    if (!ok || avgCount <= 0) {
        mapLog(QString("M1/ERR invalid avgCount: \"%1\"").arg(m_avgCountEdit ? m_avgCountEdit->text() : ""));
        return;
    }

    const bool xOn = m_xAxisCheck && m_xAxisCheck->isChecked();
    const bool yOn = m_yAxisCheck && m_yAxisCheck->isChecked();
    const bool zOn = m_zAxisCheck && m_zAxisCheck->isChecked();
    if (!xOn && !yOn && !zOn) {
        mapLog("M1/ERR no scan axis selected");
        return;
    }

    auto readAxis = [&](const char* axisName, bool enabled, QLineEdit* centerEdit, QLineEdit* lengthEdit, QLineEdit* stepEdit,
                        double& center, double& length, double& step, int& points) -> bool {
        center = 0.0;
        length = 0.0;
        step = 0.0;
        points = 1;
        if (!enabled) {
            return true;
        }

        bool okC = false;
        bool okL = false;
        bool okS = false;
        center = centerEdit ? centerEdit->text().trimmed().toDouble(&okC) : 0.0;
        length = lengthEdit ? lengthEdit->text().trimmed().toDouble(&okL) : 0.0;
        step = stepEdit ? stepEdit->text().trimmed().toDouble(&okS) : 0.0;

        if (!okC || !okL || !okS) {
            mapLog(QString("M1/ERR invalid %1 axis input").arg(axisName));
            return false;
        }
        if (length < 0.0) {
            mapLog(QString("M1/ERR %1.length must be >= 0").arg(axisName));
            return false;
        }
        if (step <= 0.0) {
            mapLog(QString("M1/ERR %1.step must be > 0").arg(axisName));
            return false;
        }

        points = static_cast<int>(std::floor(length / step + 0.5)) + 1;
        if (points < 1) {
            points = 1;
        }
        return true;
    };

    double xCenter = 0.0, xLength = 0.0, xStep = 0.0;
    double yCenter = 0.0, yLength = 0.0, yStep = 0.0;
    double zCenter = 0.0, zLength = 0.0, zStep = 0.0;
    int xPoints = 1, yPoints = 1, zPoints = 1;

    if (!readAxis("X", xOn, m_xCenterEdit, m_xLengthEdit, m_xStepEdit, xCenter, xLength, xStep, xPoints)) return;
    if (!readAxis("Y", yOn, m_yCenterEdit, m_yLengthEdit, m_yStepEdit, yCenter, yLength, yStep, yPoints)) return;
    if (!readAxis("Z", zOn, m_zCenterEdit, m_zLengthEdit, m_zStepEdit, zCenter, zLength, zStep, zPoints)) return;

    m_runCtx.wavelen = centerWave;
    m_runCtx.unit = "nm";
    m_runCtx.expTimeSec = expSec;
    m_runCtx.slitUm = slitUm;
    m_runCtx.times = avgCount;
    m_runCtx.strMode = m_displayTypeCombo ? m_displayTypeCombo->currentIndex() : 0;
    m_runCtx.dWave0 = 0.0f;
    m_runCtx.dWave1 = 0.0f;

    if (m_runCtx.strMode == 0) {
        bool okSingle = false;
        const float singleNm = m_singleNmEdit ? m_singleNmEdit->text().trimmed().toFloat(&okSingle) : 0.0f;
        if (!okSingle || singleNm <= 0.0f) {
            mapLog(QString("M1/ERR invalid singleNm: \"%1\"").arg(m_singleNmEdit ? m_singleNmEdit->text() : ""));
            return;
        }
        m_runCtx.dWave1 = singleNm;
    } else if (m_runCtx.strMode == 1) {
        bool okL = false;
        bool okR = false;
        const float nmL = m_integralNmStartEdit ? m_integralNmStartEdit->text().trimmed().toFloat(&okL) : 0.0f;
        const float nmR = m_integralNmEndEdit ? m_integralNmEndEdit->text().trimmed().toFloat(&okR) : 0.0f;
        if (!okL || !okR || nmL <= 0.0f || nmR <= nmL) {
            mapLog(QString("M1/ERR invalid integralRange: [%1, %2]")
                .arg(m_integralNmStartEdit ? m_integralNmStartEdit->text() : "")
                .arg(m_integralNmEndEdit ? m_integralNmEndEdit->text() : ""));
            return;
        }
        m_runCtx.dWave0 = nmL;
        m_runCtx.dWave1 = nmR;
    } else if (m_runCtx.strMode == 2) {
    } else if (m_runCtx.strMode == 3) {
        bool okL = false;
        bool okR = false;
        const float nmL = m_fwhmNmLeftEdit ? m_fwhmNmLeftEdit->text().trimmed().toFloat(&okL) : 0.0f;
        const float nmR = m_fwhmNmRightEdit ? m_fwhmNmRightEdit->text().trimmed().toFloat(&okR) : 0.0f;
        if (!okL || !okR || nmL <= 0.0f || nmR <= nmL) {
            mapLog(QString("M1/ERR invalid fwhmRange: [%1, %2]")
                .arg(m_fwhmNmLeftEdit ? m_fwhmNmLeftEdit->text() : "")
                .arg(m_fwhmNmRightEdit ? m_fwhmNmRightEdit->text() : ""));
            return;
        }
        m_runCtx.dWave0 = nmL;
        m_runCtx.dWave1 = nmR;
    } else {
        mapLog(QString("M1/ERR invalid displayMode index=%1").arg(m_runCtx.strMode));
        return;
    }

    m_runCtx.xEnabled = xOn;
    m_runCtx.yEnabled = yOn;
    m_runCtx.zEnabled = zOn;
    m_runCtx.xCenterPos = xCenter;
    m_runCtx.yCenterPos = yCenter;
    m_runCtx.zCenterPos = zCenter;
    m_runCtx.xLength = xLength;
    m_runCtx.yLength = yLength;
    m_runCtx.zLength = zLength;
    m_runCtx.xStep = xStep;
    m_runCtx.yStep = yStep;
    m_runCtx.zStep = zStep;
    m_runCtx.pointNumX = xPoints;
    m_runCtx.pointNumY = yPoints;
    m_runCtx.pointNumZ = zPoints;
    m_runCtx.setpMode = 0;
    m_runCtx.scanMode = 0;
    m_runCtx.nNMCN = (m_runCtx.unit.compare("cm", Qt::CaseInsensitive) == 0) ? 1 : 0;
    m_runCtx.fLaserWave = m_main->m_excWave.trimmed().toFloat();
    m_runCtx.saveFilePath.clear();

    const int totalPoints = m_runCtx.pointNumX * m_runCtx.pointNumY * m_runCtx.pointNumZ;
    m_runCtxValid = true;

    mapLog("=== Mapping Module1 Read Params BEGIN ===");
    mapLog(QString("M1/base centerWave=%1nm expTime=%2s slit=%3um avgCount=%4")
        .arg(m_runCtx.wavelen).arg(m_runCtx.expTimeSec).arg(m_runCtx.slitUm).arg(m_runCtx.times));
    mapLog(QString("M1/display nMode=%1 dWave0=%2 dWave1=%3")
        .arg(m_runCtx.strMode).arg(m_runCtx.dWave0).arg(m_runCtx.dWave1));
    mapLog(QString("M1/scan scanMode=%1 setpMode=%2 unit=%3 nNMCN=%4 fLaserWave=%5")
        .arg(m_runCtx.scanMode).arg(m_runCtx.setpMode).arg(m_runCtx.unit).arg(m_runCtx.nNMCN).arg(m_runCtx.fLaserWave));
    mapLog(QString("M1/axis X enabled=%1 center=%2 length=%3 step=%4 pointNum=%5")
        .arg(m_runCtx.xEnabled ? 1 : 0).arg(m_runCtx.xCenterPos).arg(m_runCtx.xLength).arg(m_runCtx.xStep).arg(m_runCtx.pointNumX));
    mapLog(QString("M1/axis Y enabled=%1 center=%2 length=%3 step=%4 pointNum=%5")
        .arg(m_runCtx.yEnabled ? 1 : 0).arg(m_runCtx.yCenterPos).arg(m_runCtx.yLength).arg(m_runCtx.yStep).arg(m_runCtx.pointNumY));
    mapLog(QString("M1/axis Z enabled=%1 center=%2 length=%3 step=%4 pointNum=%5")
        .arg(m_runCtx.zEnabled ? 1 : 0).arg(m_runCtx.zCenterPos).arg(m_runCtx.zLength).arg(m_runCtx.zStep).arg(m_runCtx.pointNumZ));
    mapLog(QString("M1/summary totalPoints=%1 saveFilePath=\"%2\"")
        .arg(totalPoints).arg(m_runCtx.saveFilePath));
    mapLog("=== Mapping Module1 Read Params OK ===");

    mapLog("=== Mapping Module2 Init1701 BEGIN ===");

    if (m_main->m_specHandle < 0) {
        mapLog("M2/ERR spectrometer not connected");
        m_runCtxValid = false;
        return;
    }
    if (m_main->m_ccdId < 0) {
        mapLog("M2/ERR CCD not connected");
        m_runCtxValid = false;
        return;
    }

    if (!m_main->m_hSpecDll) {
        const QString path = QCoreApplication::applicationDirPath() + "/spectrometer_x86.dll";
        m_main->m_hSpecDll = LoadLibraryA(path.toLocal8Bit().constData());
    }
    if (!m_main->m_hDfieldDll) {
        const QString path = QCoreApplication::applicationDirPath() + "/zl_ccd_x86.dll";
        m_main->m_hDfieldDll = LoadLibraryA(path.toLocal8Bit().constData());
    }
    if (!m_main->m_hSpecDll || !m_main->m_hDfieldDll) {
        mapLog("M2/ERR spectrometer/CCD dll not loaded");
        m_runCtxValid = false;
        return;
    }

    typedef bool (*Fn_MoveToWave)(int, float);
    typedef bool (*Fn_GetPixSize)(float&);
    typedef bool (*Fn_GetDevSize)(int&, int&);
    typedef bool (*Fn_PixelsToWaves)(int, int, int, float, int, int, int, float*);
    typedef bool (*Fn_GetTurret)(int, int*);
    typedef bool (*Fn_GetGrating)(int, int*);
    typedef bool (*Fn_SetExpTime)(float);
    typedef bool (*Fn_SetSlitWidth)(int, int, int);
    typedef int (*Fn_MapSetShowMode)(int, float*);
    typedef int (*Fn_MapSetXData)(float*, int);

    auto fnMoveToWave = (Fn_MoveToWave)GetProcAddress(m_main->m_hSpecDll, "spec_move_to_wave");
    auto fnGetPixSize = (Fn_GetPixSize)GetProcAddress(m_main->m_hDfieldDll, "GetPixSize");
    auto fnGetDevSize = (Fn_GetDevSize)GetProcAddress(m_main->m_hDfieldDll, "GetDevSize");
    auto fnPixelsToWaves = (Fn_PixelsToWaves)GetProcAddress(m_main->m_hSpecDll, "spec_pixels_to_waves");
    auto fnGetTurret = (Fn_GetTurret)GetProcAddress(m_main->m_hSpecDll, "spec_get_turret");
    auto fnGetGrating = (Fn_GetGrating)GetProcAddress(m_main->m_hSpecDll, "spec_get_grating");
    auto fnSetExpTime = (Fn_SetExpTime)GetProcAddress(m_main->m_hDfieldDll, "SetExpTime");
    auto fnSetSlitWidth = (Fn_SetSlitWidth)GetProcAddress(m_main->m_hSpecDll, "spec_set_slit_width");

    if (!g_mappingDll) {
        const QString appDir = QCoreApplication::applicationDirPath();
        const QString dll1 = appDir + "/zlmapping_x86.dll";
        const QString dll2 = appDir + "/zlmappingd_x86.dll";
        const QString dll3 = appDir + "/../Release/zlmapping_x86.dll";
        g_mappingDll = LoadLibraryA(dll1.toLocal8Bit().constData());
        if (!g_mappingDll) g_mappingDll = LoadLibraryA(dll2.toLocal8Bit().constData());
        if (!g_mappingDll) g_mappingDll = LoadLibraryA(dll3.toLocal8Bit().constData());
    }
    auto fnMapSetShowMode = g_mappingDll ? (Fn_MapSetShowMode)GetProcAddress(g_mappingDll, "ZLM_SetShowMode") : nullptr;
    struct MapScanParaLegacy {
        int AccNum;
        double Time;
        int PixNum;
        int ScanMode;
        double XCenterPos;
        double YCenterPos;
        double XLength;
        double YLength;
        double xStep;
        double yStep;
        int PointNumX;
        int PointNumY;
        int SetpMode;
        int nNMCN;
        float fLaserWave;
        int nTrigger;
        int Xnum;
        int Ynum;
    };
    typedef int (*Fn_MapSetScanPara)(MapScanParaLegacy*, float*);
    auto fnMapSetScanPara = g_mappingDll ? (Fn_MapSetScanPara)GetProcAddress(g_mappingDll, "ZLM_SetScanPara") : nullptr;
    auto fnMapSetXData = g_mappingDll ? (Fn_MapSetXData)GetProcAddress(g_mappingDll, "ZLM_SetXData") : nullptr;

    if (!fnMoveToWave || !fnGetPixSize || !fnGetDevSize || !fnPixelsToWaves || !fnGetTurret || !fnGetGrating || !fnSetExpTime || !fnSetSlitWidth) {
        mapLog("M2/ERR GetProcAddress missing spectrometer/CCD function");
        m_runCtxValid = false;
        return;
    }
    if (!g_mappingDll || !fnMapSetShowMode || !fnMapSetScanPara || !fnMapSetXData) {
        mapLog("M2/ERR mapping dll or ZLM_SetShowMode/ZLM_SetScanPara/ZLM_SetXData missing");
        m_runCtxValid = false;
        return;
    }

    const int specH = m_main->m_specHandle;
    bool ret = fnMoveToWave(specH, m_runCtx.wavelen);
    mapLog(QString("M2/1701.Step1 spec_move_to_wave(handle=%1, wave=%2) => %3")
        .arg(specH).arg(m_runCtx.wavelen).arg(ret ? "OK" : "FAILED"));
    if (!ret) {
        m_runCtxValid = false;
        return;
    }

    float pixSize = 0.0f;
    ret = fnGetPixSize(pixSize);
    mapLog(QString("M2/1701.Step2a GetPixSize => %1, pixSize=%2")
        .arg(ret ? "OK" : "FAILED").arg(pixSize));
    if (!ret) {
        m_runCtxValid = false;
        return;
    }

    int xSize = 2048;
    int ySize = 0;
    ret = fnGetDevSize(xSize, ySize);
    mapLog(QString("M2/1701.Step2b GetDevSize => %1, x=%2, y=%3")
        .arg(ret ? "OK" : "FAILED").arg(xSize).arg(ySize));
    if (!ret || xSize <= 0) {
        m_runCtxValid = false;
        return;
    }

    int turret = 0;
    int grating = 0;
    ret = fnGetTurret(specH, &turret);
    mapLog(QString("M2/1701.Step2c spec_get_turret => %1, turret=%2")
        .arg(ret ? "OK" : "FAILED").arg(turret));
    if (!ret) {
        m_runCtxValid = false;
        return;
    }

    ret = fnGetGrating(specH, &grating);
    mapLog(QString("M2/1701.Step2d spec_get_grating => %1, grating=%2")
        .arg(ret ? "OK" : "FAILED").arg(grating));
    if (!ret) {
        m_runCtxValid = false;
        return;
    }

    QVector<float> xWaveFloat(xSize, 0.0f);
    ret = fnPixelsToWaves(specH, turret, grating, m_runCtx.wavelen, static_cast<int>(pixSize), xSize, 1, xWaveFloat.data());
    mapLog(QString("M2/1701.Step2e spec_pixels_to_waves(turret=%1, grating=%2, center=%3, pixW=%4, count=%5) => %6")
        .arg(turret).arg(grating).arg(m_runCtx.wavelen).arg(static_cast<int>(pixSize)).arg(xSize).arg(ret ? "OK" : "FAILED"));
    if (!ret) {
        m_runCtxValid = false;
        return;
    }

    m_initXPixels = xSize;
    m_initXWaves.resize(xSize);
    for (int i = 0; i < xSize; ++i) {
        m_initXWaves[i] = static_cast<double>(xWaveFloat[i]);
    }
    if (xSize > 0) {
        mapLog(QString("M2/1701.Step2f XWave first=%1 mid=%2 last=%3")
            .arg(m_initXWaves.first())
            .arg(m_initXWaves[xSize / 2])
            .arg(m_initXWaves.last()));
    }

    const float expMs = m_runCtx.expTimeSec * 1000.0f;
    ret = fnSetExpTime(expMs);
    mapLog(QString("M2/1701.Step3a SetExpTime(%1ms) => %2")
        .arg(expMs).arg(ret ? "OK" : "FAILED"));
    if (!ret) {
        m_runCtxValid = false;
        return;
    }

    if (m_main->m_slitIndices.isEmpty()) {
        mapLog("M2/1701.Step3b spec_set_slit_width skipped: no slit installed");
    } else {
        bool slitAllOk = true;
        for (int slitIdx : m_main->m_slitIndices) {
            const bool sret = fnSetSlitWidth(specH, slitIdx, m_runCtx.slitUm);
            mapLog(QString("M2/1701.Step3b spec_set_slit_width(handle=%1, idx=%2, um=%3) => %4")
                .arg(specH).arg(slitIdx).arg(m_runCtx.slitUm).arg(sret ? "OK" : "FAILED"));
            slitAllOk = slitAllOk && sret;
        }
        if (!slitAllOk) {
            m_runCtxValid = false;
            return;
        }
    }

    float dwave[2] = { 0.0f, 0.0f };
    switch (m_runCtx.strMode) {
    case 0:
        dwave[1] = m_runCtx.dWave1;
        break;
    case 1:
    case 3:
        dwave[0] = m_runCtx.dWave0;
        dwave[1] = m_runCtx.dWave1;
        break;
    case 2:
        break;
    default:
        mapLog(QString("M2/ERR invalid nMode=%1 before ZLM_SetShowMode").arg(m_runCtx.strMode));
        m_runCtxValid = false;
        return;
    }

    const int showRc = fnMapSetShowMode(m_runCtx.strMode, dwave);
    mapLog(QString("M2/1701.Step3c ZLM_SetShowMode(nMode=%1,dWave0=%2,dWave1=%3) => rc=%4")
        .arg(m_runCtx.strMode).arg(dwave[0]).arg(dwave[1]).arg(showRc));

    mapLog(QString("M2/summary xPixels=%1 xWaveCount=%2")
        .arg(m_initXPixels).arg(m_initXWaves.size()));
    mapLog("=== Mapping Module2 Init1701 OK ===");

    mapLog("=== Mapping Module3 Fun28 ReadAndCalc BEGIN ===");

    const int accNum28 = m_runCtx.times;
    const double time28 = m_runCtx.expTimeSec;
    const int pixNum28 = m_initXPixels;
    const int scanMode28 = m_runCtx.scanMode;
    const double dXCenterPos28 = m_runCtx.xCenterPos;
    const double dYCenterPos28 = m_runCtx.yCenterPos;
    const double dZCenterPos28 = m_runCtx.zCenterPos;
    const double dXLength28 = m_runCtx.xLength;
    const double dYLength28 = m_runCtx.yLength;
    const double dZLength28 = m_runCtx.zLength;
    const int nPointNumX28 = m_runCtx.pointNumX;
    const int nPointNumY28 = m_runCtx.pointNumY;
    const int nPointNumZ28 = m_runCtx.pointNumZ;
    const int setpMode28 = m_runCtx.setpMode;
    const int nNMCN28 = m_runCtx.nNMCN;
    const float fLaserWave28 = m_runCtx.fLaserWave;
    const double xStep28 = m_runCtx.xStep;
    const double yStep28 = m_runCtx.yStep;
    const double zStep28 = m_runCtx.zStep;

    mapLog(QString("M3/F28.read AccNum=%1 Time=%2 PixNum=%3 ScanMode=%4 SetpMode=%5 nNMCN=%6 fLaserWave=%7")
        .arg(accNum28).arg(time28).arg(pixNum28).arg(scanMode28).arg(setpMode28).arg(nNMCN28).arg(fLaserWave28));
    mapLog(QString("M3/F28.read Center(X,Y,Z)=[%1,%2,%3]")
        .arg(dXCenterPos28).arg(dYCenterPos28).arg(dZCenterPos28));
    mapLog(QString("M3/F28.read Length(X,Y,Z)=[%1,%2,%3]")
        .arg(dXLength28).arg(dYLength28).arg(dZLength28));
    mapLog(QString("M3/F28.read Step(X,Y,Z)=[%1,%2,%3]")
        .arg(xStep28).arg(yStep28).arg(zStep28));
    mapLog(QString("M3/F28.read PointNumInput(X,Y,Z)=[%1,%2,%3]")
        .arg(nPointNumX28).arg(nPointNumY28).arg(nPointNumZ28));

    int nXnum28 = 1;
    int nYnum28 = 1;
    int nZnum28 = 1;

    if (m_runCtx.xEnabled && xStep28 > 0.0) {
        nXnum28 = static_cast<int>(std::floor(0.5 + dXLength28 / xStep28)) + 1;
    }
    if (m_runCtx.yEnabled && yStep28 > 0.0) {
        nYnum28 = static_cast<int>(std::floor(0.5 + dYLength28 / yStep28)) + 1;
    }
    if (m_runCtx.zEnabled && zStep28 > 0.0) {
        nZnum28 = static_cast<int>(std::floor(0.5 + dZLength28 / zStep28)) + 1;
    }

    int validAxisCount28 = 0;
    validAxisCount28 = nXnum28 > 1 ? validAxisCount28 + 1 : validAxisCount28;
    validAxisCount28 = nYnum28 > 1 ? validAxisCount28 + 1 : validAxisCount28;
    validAxisCount28 = nZnum28 > 1 ? validAxisCount28 + 1 : validAxisCount28;

    mapLog(QString("M3/F28.calc nXnum=%1 nYnum=%2 nZnum=%3")
        .arg(nXnum28).arg(nYnum28).arg(nZnum28));
    mapLog(QString("M3/F28.calc validAxisCount=%1")
        .arg(validAxisCount28));

    double paraXCenter28 = 0.0;
    double paraYCenter28 = 0.0;
    double paraXLength28 = 0.0;
    double paraYLength28 = 0.0;
    double paraXStep28 = 0.0;
    double paraYStep28 = 0.0;
    int paraPointNumX28 = 1;
    int paraPointNumY28 = 1;
    int paraXnum28 = 1;
    int paraYnum28 = 1;
    QString remapMode28;

    if (validAxisCount28 == 1) {
        if (nXnum28 > 1) {
            remapMode28 = "single:X->X,Y->Y";
            paraXCenter28 = dXCenterPos28;
            paraXLength28 = dXLength28;
            paraPointNumX28 = nPointNumX28;
            paraXStep28 = xStep28;
            paraXnum28 = nXnum28;

            paraYCenter28 = dYCenterPos28;
            paraYLength28 = dYLength28;
            paraPointNumY28 = nPointNumY28;
            paraYStep28 = yStep28;
            paraYnum28 = nYnum28;
        }
        if (nYnum28 > 1) {
            remapMode28 = "single:Y->X,Z->Y";
            paraXCenter28 = dYCenterPos28;
            paraXLength28 = dYLength28;
            paraPointNumX28 = nPointNumY28;
            paraXStep28 = yStep28;
            paraXnum28 = nYnum28;

            paraYCenter28 = dZCenterPos28;
            paraYLength28 = dZLength28;
            paraPointNumY28 = nPointNumZ28;
            paraYStep28 = zStep28;
            paraYnum28 = nZnum28;
        }
        if (nZnum28 > 1) {
            remapMode28 = "single:Z with X->X,Z->Y";
            paraXCenter28 = dXCenterPos28;
            paraXLength28 = dXLength28;
            paraPointNumX28 = nPointNumX28;
            paraXStep28 = xStep28;
            paraXnum28 = nXnum28;

            paraYCenter28 = dZCenterPos28;
            paraYLength28 = dZLength28;
            paraPointNumY28 = nPointNumZ28;
            paraYStep28 = zStep28;
            paraYnum28 = nZnum28;
        }
    } else {
        if (nXnum28 > 1 && nYnum28 > 1) {
            remapMode28 = "XY";
            paraXCenter28 = dXCenterPos28;
            paraXLength28 = dXLength28;
            paraPointNumX28 = nPointNumX28;
            paraXStep28 = xStep28;
            paraXnum28 = nXnum28;

            paraYCenter28 = dYCenterPos28;
            paraYLength28 = dYLength28;
            paraPointNumY28 = nPointNumY28;
            paraYStep28 = yStep28;
            paraYnum28 = nYnum28;
        } else if (nXnum28 > 1 && nZnum28 > 1) {
            remapMode28 = "XZ";
            paraXCenter28 = dXCenterPos28;
            paraXLength28 = dXLength28;
            paraPointNumX28 = nPointNumX28;
            paraXStep28 = xStep28;
            paraXnum28 = nXnum28;

            paraYCenter28 = dZCenterPos28;
            paraYLength28 = dZLength28;
            paraPointNumY28 = nPointNumZ28;
            paraYStep28 = zStep28;
            paraYnum28 = nZnum28;
        } else {
            remapMode28 = "YZ";
            paraXCenter28 = dYCenterPos28;
            paraXLength28 = dYLength28;
            paraPointNumX28 = nPointNumY28;
            paraXStep28 = yStep28;
            paraXnum28 = nYnum28;

            paraYCenter28 = dZCenterPos28;
            paraYLength28 = dZLength28;
            paraPointNumY28 = nPointNumZ28;
            paraYStep28 = zStep28;
            paraYnum28 = nZnum28;
        }
    }

    mapLog(QString("M3/F28.remap mode=%1")
        .arg(remapMode28));
    mapLog(QString("M3/F28.remap para.X center=%1 length=%2 step=%3 pointNum=%4 calcNum=%5")
        .arg(paraXCenter28).arg(paraXLength28).arg(paraXStep28).arg(paraPointNumX28).arg(paraXnum28));
    mapLog(QString("M3/F28.remap para.Y center=%1 length=%2 step=%3 pointNum=%4 calcNum=%5")
        .arg(paraYCenter28).arg(paraYLength28).arg(paraYStep28).arg(paraPointNumY28).arg(paraYnum28));

    MapScanParaLegacy para28 = {};
    para28.AccNum = accNum28;
    para28.Time = time28;
    para28.PixNum = pixNum28;
    para28.ScanMode = scanMode28;
    para28.XCenterPos = paraXCenter28;
    para28.YCenterPos = paraYCenter28;
    para28.XLength = paraXLength28;
    para28.YLength = paraYLength28;
    para28.xStep = paraXStep28;
    para28.yStep = paraYStep28;
    para28.PointNumX = paraPointNumX28;
    para28.PointNumY = paraPointNumY28;
    para28.SetpMode = setpMode28;
    para28.nNMCN = nNMCN28;
    para28.fLaserWave = fLaserWave28;
    para28.nTrigger = 0;
    para28.Xnum = paraXnum28;
    para28.Ynum = paraYnum28;

    float dRet28[8] = { 0.0f };
    const int scanParaRc28 = fnMapSetScanPara(&para28, dRet28);
    mapLog(QString("M3/F28.call ZLM_SetScanPara(rc=%1)")
        .arg(scanParaRc28));
    mapLog(QString("M3/F28.call dRet=[%1,%2,%3,%4,%5,%6,%7,%8]")
        .arg(dRet28[0]).arg(dRet28[1]).arg(dRet28[2]).arg(dRet28[3])
        .arg(dRet28[4]).arg(dRet28[5]).arg(dRet28[6]).arg(dRet28[7]));
    mapLog(QString("M3/F28.call matrix Xnum=%1 Ynum=%2 (SetpMode=%3)")
        .arg(para28.Xnum).arg(para28.Ynum).arg(para28.SetpMode));
    mapLog("=== Mapping Module3 Fun28 ReadAndCalc OK ===");

    mapLog("=== Mapping Module4 SetXData BEGIN ===");
    if (m_initXPixels <= 0 || m_initXWaves.isEmpty() || m_initXWaves.size() != m_initXPixels) {
        mapLog(QString("M4/ERR invalid XData: xPixels=%1 waveCount=%2")
            .arg(m_initXPixels).arg(m_initXWaves.size()));
        m_runCtxValid = false;
        return;
    }

    QVector<float> xDataForDll(m_initXPixels, 0.0f);
    for (int i = 0; i < m_initXPixels; ++i) {
        xDataForDll[i] = static_cast<float>(m_initXWaves[i]);
    }

    mapLog(QString("M4/input size=%1 first=%2 mid=%3 last=%4")
        .arg(m_initXPixels)
        .arg(xDataForDll.first())
        .arg(xDataForDll[m_initXPixels / 2])
        .arg(xDataForDll.last()));

    const int setXDataRc = fnMapSetXData(xDataForDll.data(), m_initXPixels);
    mapLog(QString("M4/call ZLM_SetXData(size=%1) => rc=%2")
        .arg(m_initXPixels).arg(setXDataRc));
    mapLog("=== Mapping Module4 SetXData OK ===");

    mapLog("=== Mapping Module5 StartScan2 Prep BEGIN ===");

    const float startX = static_cast<float>(m_runCtx.xCenterPos - m_runCtx.xLength / 2.0);
    const float endX = static_cast<float>(m_runCtx.xCenterPos + m_runCtx.xLength / 2.0 + m_runCtx.xStep);
    const float startY = static_cast<float>(m_runCtx.yCenterPos - m_runCtx.yLength / 2.0);
    const float endY = static_cast<float>(m_runCtx.yCenterPos + m_runCtx.yLength / 2.0 + m_runCtx.yStep);
    const float startZ = static_cast<float>(m_runCtx.zCenterPos - m_runCtx.zLength / 2.0);
    const float endZ = static_cast<float>(m_runCtx.zCenterPos + m_runCtx.zLength / 2.0 + m_runCtx.zStep);

    const int xNumRun = (m_runCtx.xStep > 0.0)
        ? (static_cast<int>(std::floor(0.5 + m_runCtx.xLength / m_runCtx.xStep)) + 1)
        : 1;
    const int yNumRun = (m_runCtx.yStep > 0.0)
        ? (static_cast<int>(std::floor(0.5 + m_runCtx.yLength / m_runCtx.yStep)) + 1)
        : 1;
    const int zNumRun = (m_runCtx.zStep > 0.0)
        ? (static_cast<int>(std::floor(0.5 + m_runCtx.zLength / m_runCtx.zStep)) + 1)
        : 1;

    int nAxisNumTest = 0;
    nAxisNumTest = xNumRun > 1 ? nAxisNumTest + 1 : nAxisNumTest;
    nAxisNumTest = yNumRun > 1 ? nAxisNumTest + 1 : nAxisNumTest;
    nAxisNumTest = zNumRun > 1 ? nAxisNumTest + 1 : nAxisNumTest;

    const bool isXAndY = (xNumRun != 1 && nAxisNumTest == 2) || (nAxisNumTest == 1 && (xNumRun > 1 || zNumRun > 1));
    const bool isYAndZ = (nAxisNumTest == 2 && yNumRun > 1) || (nAxisNumTest == 1 && xNumRun > 1);
    const int showXNum = isXAndY ? xNumRun : yNumRun;
    const int showYNum = isYAndZ ? yNumRun : zNumRun;

    mapLog(QString("M5/run start(X,Y,Z)=[%1,%2,%3]")
        .arg(startX).arg(startY).arg(startZ));
    mapLog(QString("M5/run end(X,Y,Z)=[%1,%2,%3]")
        .arg(endX).arg(endY).arg(endZ));
    mapLog(QString("M5/run num(X,Y,Z)=[%1,%2,%3]")
        .arg(xNumRun).arg(yNumRun).arg(zNumRun));
    mapLog(QString("M5/run axisJudge nAxisNumTest=%1 isXAndY=%2 isYAndZ=%3")
        .arg(nAxisNumTest).arg(isXAndY ? 1 : 0).arg(isYAndZ ? 1 : 0));
    mapLog(QString("M5/run showSize showXNum=%1 showYNum=%2")
        .arg(showXNum).arg(showYNum));
    mapLog("=== Mapping Module5 StartScan2 Prep OK ===");

    if (m_heatmapPlot && m_heatmapColorMap) {
        m_heatmapColorMap->data()->setSize(showXNum, showYNum);
        m_heatmapColorMap->data()->setRange(QCPRange(1, showXNum), QCPRange(1, showYNum));
        for (int x = 0; x < showXNum; ++x) {
            for (int y = 0; y < showYNum; ++y) {
                m_heatmapColorMap->data()->setCell(x, y, 0.0);
            }
        }
        m_heatmapColorMap->setDataRange(QCPRange(0.0, 1.0));
        m_heatmapColorMap->keyAxis()->setRange(1, showXNum);
        m_heatmapColorMap->valueAxis()->setRange(1, showYNum);
        m_heatmapPlot->replot();
    }

    QVector<int> xList;
    xList.reserve(showXNum);
    for (int i = 0; i < showXNum; ++i) {
        xList.push_back(i);
    }

    QVector<double> acqData(m_initXPixels, 0.0);
    QVector<float> acqVec(m_initXPixels, 0.0f);
    QVector<float> scanLineData;
    QVector<float> lineOutVec(showXNum, 0.0f);
    int writeSize[2] = { 1, m_initXPixels };

    mapLog("=== Mapping Module6 StartScan2 Prepare BEGIN ===");

    const QString appDir = QCoreApplication::applicationDirPath();
    const QString mappingFileDllPath = QDir(appDir).filePath("zlmappingfile_x86.dll");
    if (!g_mappingFileDll) {
        g_mappingFileDll = LoadLibraryW(reinterpret_cast<LPCWSTR>(mappingFileDllPath.utf16()));
    }
    if (!g_mappingFileDll) {
        mapLog(QString("M6/ERR zlmappingfile_x86.dll load failed: %1").arg(mappingFileDllPath));
        m_runCtxValid = false;
        return;
    }

    typedef int (*Fn_StartScan2)();
    typedef int (*Fn_ZLMWriteRows)(char*, float*, int*, bool);
    typedef int (*Fn_ZLMFSetFilePath)(char*);

    auto fnMapStartScan2 = reinterpret_cast<Fn_StartScan2>(GetProcAddress(g_mappingDll, "StartScan2"));
    auto fnMapWriteRows = reinterpret_cast<Fn_ZLMWriteRows>(GetProcAddress(g_mappingFileDll, "ZLM_WriteRows"));
    auto fnMapSetFilePath = reinterpret_cast<Fn_ZLMFSetFilePath>(GetProcAddress(g_mappingFileDll, "ZLMF_SetFilePath"));

    if (!fnMapStartScan2 || !fnMapWriteRows || !fnMapSetFilePath) {
        mapLog(QString("M6/ERR GetProcAddress failed: StartScan2=%1 WriteRows=%2 SetFilePath=%3")
            .arg(fnMapStartScan2 ? "OK" : "NULL")
            .arg(fnMapWriteRows ? "OK" : "NULL")
            .arg(fnMapSetFilePath ? "OK" : "NULL"));
        m_runCtxValid = false;
        return;
    }

    const QString saveRoot = "C:/ZLDatas";
    QDir().mkpath(saveRoot);
    const qint64 mapStartTime = QDateTime::currentMSecsSinceEpoch();
    const QString saveBasePath = QDir(saveRoot).filePath(QString::number(mapStartTime));
    m_runCtx.saveFilePath = saveBasePath;
    const QString rawFilePath = saveBasePath + ".raw";
    const QString hdrFilePath = saveBasePath + ".hdr";

    QVector<float> showAxisData(m_initXPixels, 0.0f);
    for (int i = 0; i < m_initXPixels; ++i) {
        showAxisData[i] = static_cast<float>(m_initXWaves[i]);
    }

    QString hdrText;
    hdrText += "ENVI\n";
    hdrText += "description = {}\n";
    hdrText += QString("samples = %1\n").arg(showXNum);
    hdrText += QString("lines = %1\n").arg(showYNum);
    hdrText += QString("bands = %1\n").arg(m_initXPixels);
    hdrText += "header offset = 0\n";
    hdrText += "file type = ENVI Standard\n";
    hdrText += "data type = 4\n";
    hdrText += "interleave = bip\n";
    hdrText += "byte order = 0\n";
    hdrText += "sensor type = Unknown\n";
    hdrText += "wavelength units = nm\n";
    hdrText += "binning = 0, 0\n";
    hdrText += "map info = { Arbitrary,1,1,0,0,1,1,0,North }\n";
    hdrText += "wavelength = { \n";
    for (int i = 0; i < m_initXWaves.size(); ++i) {
        hdrText += QString::number(m_initXWaves[i], 'f', 6);
        hdrText += (i == m_initXWaves.size() - 1) ? "\n" : ",\n";
    }
    hdrText += "}\n";
    hdrText += "[Source]\n";
    hdrText += "DataSource=mapping\n";
    hdrText += "[condition]\n";
    hdrText += QString("LaserWave = %1\n").arg(m_runCtx.fLaserWave, 0, 'f', 6);
    hdrText += QString("zolixmap info = { Arbitrary,%1,%2,%3,%4,%5,%6,0,North }\n")
        .arg(isXAndY ? startX : startY, 0, 'f', 6)
        .arg(isYAndZ ? startY : startZ, 0, 'f', 6)
        .arg(isXAndY ? endX : endY, 0, 'f', 6)
        .arg(isYAndZ ? endY : endZ, 0, 'f', 6)
        .arg(isXAndY ? static_cast<float>(m_runCtx.xStep) : static_cast<float>(m_runCtx.yStep), 0, 'f', 6)
        .arg(isYAndZ ? static_cast<float>(m_runCtx.yStep) : static_cast<float>(m_runCtx.zStep), 0, 'f', 6);

    QFile hdrFile(hdrFilePath);
    if (!hdrFile.open(QIODevice::WriteOnly | QIODevice::Truncate | QIODevice::Text)) {
        mapLog(QString("M6/ERR hdr open failed: %1").arg(hdrFilePath));
        m_runCtxValid = false;
        return;
    }
    hdrFile.write(hdrText.toUtf8());
    hdrFile.close();

    QByteArray rawFileBytes = QFile::encodeName(rawFilePath);
    QByteArray saveBaseBytes = QFile::encodeName(saveBasePath);

    const int startScan2Rc = fnMapStartScan2();
    const int writeAxisRc = fnMapWriteRows(rawFileBytes.data(), showAxisData.data(), writeSize, false);

    mapLog(QString("M6/file raw=%1").arg(rawFilePath));
    mapLog(QString("M6/file hdr=%1").arg(hdrFilePath));
    mapLog(QString("M6/file saveBase=%1").arg(saveBasePath));
    mapLog(QString("M6/call StartScan2() => rc=%1").arg(startScan2Rc));
    mapLog(QString("M6/call ZLM_WriteRows(axis,size=%1) => rc=%2").arg(m_initXPixels).arg(writeAxisRc));
    mapLog("=== Mapping Module6 StartScan2 Prepare OK ===");

    mapLog("=== Mapping Module7 ScanLoopSkeleton BEGIN ===");

    typedef bool (*Fn_MotorMoveto)(void*, int, double);
    typedef bool (*Fn_GetPosition)(void*, int, double&);
    typedef int (*Fn_StopScan)();
    typedef bool (*Fn_DataAcqOneShot)(double*, int);
    typedef int (*Fn_CauData)(float*, float*);

    auto fnMotorMoveto = reinterpret_cast<Fn_MotorMoveto>(GetProcAddress(m_main->m_hStageDll, "MotorMoveto"));
    auto fnGetPosition = reinterpret_cast<Fn_GetPosition>(GetProcAddress(m_main->m_hStageDll, "GetPosition"));
    auto fnMapStopScan = reinterpret_cast<Fn_StopScan>(GetProcAddress(g_mappingDll, "StopScan"));
    auto fnDataAcqOneShot = reinterpret_cast<Fn_DataAcqOneShot>(GetProcAddress(m_main->m_hDfieldDll, "DataAcqOneShot"));
    auto fnMapCauData = reinterpret_cast<Fn_CauData>(GetProcAddress(g_mappingDll, "CauData"));

    if (!fnMotorMoveto || !fnGetPosition || !fnMapStopScan || !fnDataAcqOneShot || !fnMapCauData) {
        mapLog(QString("M7/ERR GetProcAddress failed: MotorMoveto=%1 GetPosition=%2 StopScan=%3 DataAcqOneShot=%4 CauData=%5")
            .arg(fnMotorMoveto ? "OK" : "NULL")
            .arg(fnGetPosition ? "OK" : "NULL")
            .arg(fnMapStopScan ? "OK" : "NULL")
            .arg(fnDataAcqOneShot ? "OK" : "NULL")
            .arg(fnMapCauData ? "OK" : "NULL"));
        m_runCtxValid = false;
        return;
    }
    if (!m_main->m_stageHandle || !m_main->m_hDfieldDll) {
        mapLog(QString("M7/ERR runtime handle invalid: stage=%1 ccdDll=%2")
            .arg(m_main->m_stageHandle ? "OK" : "NULL")
            .arg(m_main->m_hDfieldDll ? "OK" : "NULL"));
        m_runCtxValid = false;
        return;
    }

    m_stopRequested = false;
    if (m_startBtn) m_startBtn->setEnabled(false);
    if (m_stopBtn) m_stopBtn->setEnabled(true);

    auto moveAxis = [&](int axis, double value, const QString& tag) -> bool {
        const double motorValue = (axis == 2) ? value * 10.0 : value;
        const bool ok = fnMotorMoveto(m_main->m_stageHandle, axis, motorValue);
        if (!ok) {
            mapLog(QString("M7/ERR %1 axis=%2 target=%3 motorValue=%4")
                .arg(tag).arg(axis).arg(value).arg(motorValue));
        }
        return ok;
    };

    auto readPos = [&](int axis, double& value) -> bool {
        value = 0.0;
        return fnGetPosition(m_main->m_stageHandle, axis, value);
    };

    auto moveBackCenter = [&]() {
        if (zNumRun != 1) moveAxis(2, m_runCtx.zCenterPos, "restoreZ");
        if (yNumRun != 1) moveAxis(1, m_runCtx.yCenterPos, "restoreY");
        if (xNumRun != 1) moveAxis(0, m_runCtx.xCenterPos, "restoreX");
    };

    bool aborted = false;
    bool firstPointLogged = false;
    bool firstWriteLogged = false;
    bool firstLineCalcLogged = false;
    int acquiredPointCount = 0;
    int writtenPointCount = 0;
    int calculatedLineCount = 0;
    bool heatmapRangeValid = false;
    double heatmapMin = 0.0;
    double heatmapMax = 0.0;
    if (zNumRun != 1) {
        mapLog(QString("M7/preMove Z => %1").arg(startZ - static_cast<float>(m_runCtx.zStep)));
        if (!moveAxis(2, startZ - static_cast<float>(m_runCtx.zStep), "preMoveZ")) {
            m_runCtxValid = false;
            return;
        }
    }

    for (int i = 0; i < zNumRun && !aborted; ++i) {
        QCoreApplication::processEvents();
        if (m_stopRequested) {
            aborted = true;
            break;
        }

        const double zTarget = startZ + static_cast<float>(m_runCtx.zStep) * i;
        if (zNumRun != 1) {
            mapLog(QString("M7/layer z=%1/%2 target=%3").arg(i + 1).arg(zNumRun).arg(zTarget));
            if (!moveAxis(2, zTarget, "moveZ")) {
                m_runCtxValid = false;
                return;
            }
        }

        if (!isXAndY) scanLineData.clear();

        for (int j = 0; j < yNumRun && !aborted; ++j) {
            QCoreApplication::processEvents();
            if (m_stopRequested) {
                aborted = true;
                break;
            }

            const double yTarget = startY + static_cast<float>(m_runCtx.yStep) * j;
            mapLog(QString("M7/row z=%1/%2 y=%3/%4 targetY=%5 xRange=[%6 -> %7]")
                .arg(i + 1).arg(zNumRun).arg(j + 1).arg(yNumRun).arg(yTarget).arg(startX).arg(startX + static_cast<float>(m_runCtx.xStep) * (xNumRun - 1)));
            if (yNumRun != 1) {
                if (!moveAxis(1, yTarget, "moveY")) {
                    m_runCtxValid = false;
                    return;
                }
            }

            if (isXAndY) scanLineData.clear();
            for (int g = 0; g < xNumRun; ++g) {
                QCoreApplication::processEvents();
                if (m_stopRequested) {
                    aborted = true;
                    break;
                }

                if (xNumRun != 1) {
                    const double xTarget = startX + static_cast<float>(m_runCtx.xStep) * g;
                    if (!moveAxis(0, xTarget, "moveX")) {
                        m_runCtxValid = false;
                        return;
                    }
                }

                acqVec.fill(0.0f);
                const int shotCount = (std::max)(1, m_runCtx.times);
                for (int shot = 0; shot < shotCount; ++shot) {
                    if (!fnDataAcqOneShot(acqData.data(), m_initXPixels)) {
                        mapLog(QString("M8/ERR DataAcqOneShot failed at z=%1/%2 y=%3/%4 x=%5/%6 shot=%7/%8")
                            .arg(i + 1).arg(zNumRun).arg(j + 1).arg(yNumRun).arg(g + 1).arg(xNumRun)
                            .arg(shot + 1).arg(shotCount));
                        m_runCtxValid = false;
                        return;
                    }

                    for (int idx = 0; idx < m_initXPixels; ++idx) {
                        acqVec[idx] += static_cast<float>(acqData[idx] / showYNum);
                    }
                }

                ++acquiredPointCount;
                if (!firstPointLogged) {
                    double yMin = acqData[0];
                    double yMax = acqData[0];
                    for (int idx = 1; idx < m_initXPixels; ++idx) {
                        yMin = (std::min)(yMin, acqData[idx]);
                        yMax = (std::max)(yMax, acqData[idx]);
                    }
                    mapLog(QString("M8/point first z=%1/%2 y=%3/%4 x=%5/%6 first=%7 mid=%8 last=%9 min=%10 max=%11")
                        .arg(i + 1).arg(zNumRun).arg(j + 1).arg(yNumRun).arg(g + 1).arg(xNumRun)
                        .arg(acqData.first())
                        .arg(acqData[m_initXPixels / 2])
                        .arg(acqData.last())
                        .arg(yMin)
                        .arg(yMax));
                    firstPointLogged = true;
                }

                const int writePointRc = fnMapWriteRows(rawFileBytes.data(), acqVec.data(), writeSize, false);
                if (writePointRc != 1) {
                    mapLog(QString("M9/ERR ZLM_WriteRows(point) failed at z=%1/%2 y=%3/%4 x=%5/%6")
                        .arg(i + 1).arg(zNumRun).arg(j + 1).arg(yNumRun).arg(g + 1).arg(xNumRun));
                    m_runCtxValid = false;
                    return;
                }

                ++writtenPointCount;
                if (!firstWriteLogged) {
                    mapLog(QString("M9/point first writeRaw rc=%1 first=%2 mid=%3 last=%4")
                        .arg(writePointRc)
                        .arg(acqVec.first())
                        .arg(acqVec[m_initXPixels / 2])
                        .arg(acqVec.last()));
                    firstWriteLogged = true;
                }

                scanLineData += acqVec;
            }

            if (isXAndY) {
                const int cauRc = fnMapCauData(scanLineData.data(), lineOutVec.data());
                if (cauRc != 1) {
                    mapLog(QString("M10/ERR CauData(row) failed at z=%1/%2 y=%3/%4")
                        .arg(i + 1).arg(zNumRun).arg(j + 1).arg(yNumRun));
                    m_runCtxValid = false;
                    return;
                }
                ++calculatedLineCount;
                if (!firstLineCalcLogged) {
                    float zMin = lineOutVec[0];
                    float zMax = lineOutVec[0];
                    for (int idx = 1; idx < lineOutVec.size(); ++idx) {
                        zMin = (std::min)(zMin, lineOutVec[idx]);
                        zMax = (std::max)(zMax, lineOutVec[idx]);
                    }
                    mapLog(QString("M10/line first rc=%1 rowIndex=%2 size=%3 first=%4 mid=%5 last=%6 min=%7 max=%8")
                        .arg(cauRc)
                        .arg(j)
                        .arg(lineOutVec.size())
                        .arg(lineOutVec.first())
                        .arg(lineOutVec[lineOutVec.size() / 2])
                        .arg(lineOutVec.last())
                        .arg(zMin)
                        .arg(zMax));
                    firstLineCalcLogged = true;
                }

                if (m_heatmapColorMap && m_heatmapPlot) {
                    const int rowIndex = j;
                    const int copyCount = (std::min)(showXNum, lineOutVec.size());
                    for (int x = 0; x < copyCount; ++x) {
                        const double value = lineOutVec[x];
                        m_heatmapColorMap->data()->setCell(x, rowIndex, value);
                        if (!heatmapRangeValid) {
                            heatmapMin = value;
                            heatmapMax = value;
                            heatmapRangeValid = true;
                        } else {
                            heatmapMin = (std::min)(heatmapMin, value);
                            heatmapMax = (std::max)(heatmapMax, value);
                        }
                    }
                    if (heatmapRangeValid) {
                        if (qFuzzyCompare(heatmapMin + 1.0, heatmapMax + 1.0)) {
                            m_heatmapColorMap->setDataRange(QCPRange(heatmapMin - 1.0, heatmapMax + 1.0));
                        } else {
                            m_heatmapColorMap->setDataRange(QCPRange(heatmapMin, heatmapMax));
                        }
                    }
                    m_heatmapPlot->replot(QCustomPlot::rpQueuedReplot);
                }
            }
        }

        if (!isXAndY) {
            const int cauRc = fnMapCauData(scanLineData.data(), lineOutVec.data());
            if (cauRc != 1) {
                mapLog(QString("M10/ERR CauData(layer) failed at z=%1/%2")
                    .arg(i + 1).arg(zNumRun));
                m_runCtxValid = false;
                return;
            }
            ++calculatedLineCount;
            if (!firstLineCalcLogged) {
                float zMin = lineOutVec[0];
                float zMax = lineOutVec[0];
                for (int idx = 1; idx < lineOutVec.size(); ++idx) {
                    zMin = (std::min)(zMin, lineOutVec[idx]);
                    zMax = (std::max)(zMax, lineOutVec[idx]);
                }
                mapLog(QString("M10/line first rc=%1 layerIndex=%2 size=%3 first=%4 mid=%5 last=%6 min=%7 max=%8")
                    .arg(cauRc)
                    .arg(i)
                    .arg(lineOutVec.size())
                    .arg(lineOutVec.first())
                    .arg(lineOutVec[lineOutVec.size() / 2])
                    .arg(lineOutVec.last())
                    .arg(zMin)
                    .arg(zMax));
                firstLineCalcLogged = true;
            }

            if (m_heatmapColorMap && m_heatmapPlot) {
                const int rowIndex = i;
                const int copyCount = (std::min)(showXNum, lineOutVec.size());
                for (int x = 0; x < copyCount; ++x) {
                    const double value = lineOutVec[x];
                    m_heatmapColorMap->data()->setCell(x, rowIndex, value);
                    if (!heatmapRangeValid) {
                        heatmapMin = value;
                        heatmapMax = value;
                        heatmapRangeValid = true;
                    } else {
                        heatmapMin = (std::min)(heatmapMin, value);
                        heatmapMax = (std::max)(heatmapMax, value);
                    }
                }
                if (heatmapRangeValid) {
                    if (qFuzzyCompare(heatmapMin + 1.0, heatmapMax + 1.0)) {
                        m_heatmapColorMap->setDataRange(QCPRange(heatmapMin - 1.0, heatmapMax + 1.0));
                    } else {
                        m_heatmapColorMap->setDataRange(QCPRange(heatmapMin, heatmapMax));
                    }
                }
                m_heatmapPlot->replot(QCustomPlot::rpQueuedReplot);
            }
        }
    }

    const int stopScanRc = fnMapStopScan();
    mapLog(QString("M7/call StopScan() => rc=%1").arg(stopScanRc));
    moveBackCenter();
    const int writeStopRc = fnMapWriteRows(rawFileBytes.data(), acqVec.data(), writeSize, true);
    const int setFilePathRc = fnMapSetFilePath(saveBaseBytes.data());

    double posX = 0.0;
    double posY = 0.0;
    readPos(0, posX);
    readPos(1, posY);
    mapLog(QString("M7/end finalPos x=%1 y=%2 aborted=%3")
        .arg(posX).arg(posY).arg(aborted ? 1 : 0));
    mapLog(QString("M8/summary acquiredPoints=%1").arg(acquiredPointCount));
    mapLog(QString("M9/summary writtenPoints=%1").arg(writtenPointCount));
    mapLog(QString("M10/summary calculatedLines=%1").arg(calculatedLineCount));
    mapLog(QString("M9/finalize writeRawStop rc=%1").arg(writeStopRc));
    mapLog(QString("M9/finalize setFilePath rc=%1 path=%2").arg(setFilePathRc).arg(saveBasePath));

    if (m_startBtn) m_startBtn->setEnabled(true);
    if (m_stopBtn) m_stopBtn->setEnabled(false);
    mapLog("=== Mapping Module7 ScanLoopSkeleton OK ===");
}

void MappingScanDialog::onStopClicked()
{
    m_stopRequested = true;
    if (m_stopBtn) {
        m_stopBtn->setEnabled(false);
    }
    mapLog("=== Mapping Stop Requested ===");
}

