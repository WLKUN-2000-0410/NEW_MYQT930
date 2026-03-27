#include "MappingScanDialog.h"
#include "Finder930QTMYV2.h"

#include <QCheckBox>
#include <QCoreApplication>
#include <QGridLayout>
#include <QGroupBox>
#include <QLabel>
#include <QLineEdit>
#include <QPushButton>
#include <QVBoxLayout>

namespace {
QString zh(const wchar_t* text)
{
    return QString::fromWCharArray(text);
}
}

MappingScanDialog::MappingScanDialog(QWidget* parent)
    : QDialog(parent), m_main(qobject_cast<Finder930QTMYV2*>(parent))
{
    setWindowTitle("Mapping Scan");
    resize(760, 700);
    setMinimumSize(680, 620);

    setStyleSheet(
        "QDialog { background-color: #2f2f2f; color: #f2f2f2; }"
        "QGroupBox { border: 1px solid #5a5a5a; margin-top: 18px; "
        "           font-size: 22px; font-weight: 700; color: #f5f5f5; }"
        "QGroupBox::title { subcontrol-origin: margin; left: 14px; padding: 0 8px; }"
        "QLabel { color: #f0f0f0; font-size: 18px; }"
        "QCheckBox { color: #f0f0f0; }"
        "QLineEdit { background: #2b2b2b; border: 1px solid #5d5d5d; border-radius: 8px; "
        "            min-height: 44px; color: #f8f8f8; font-size: 16px; padding: 0 10px; }"
        "QPushButton { background: #77818c; color: #f8f8f8; border-radius: 6px; "
        "              min-height: 42px; font-size: 18px; border: 1px solid #818b96; }");

    auto* root = new QVBoxLayout(this);
    root->setContentsMargins(16, 16, 16, 16);
    root->setSpacing(10);

    auto* specGroup = new QGroupBox(zh(L"\u5149\u8c31\u53c2\u6570"), this);
    auto* grid = new QGridLayout(specGroup);
    grid->setContentsMargins(18, 20, 18, 18);
    grid->setHorizontalSpacing(12);
    grid->setVerticalSpacing(14);

    auto* centerLabel = new QLabel(zh(L"\u4e2d\u5fc3\u6ce2\u957f:"), specGroup);
    m_centerWaveEdit = new QLineEdit(specGroup);
    m_centerWaveEdit->setObjectName("centerWaveEdit");
    auto* centerUnit = new QLabel("nm", specGroup);

    auto* intLabel = new QLabel(zh(L"\u79ef\u5206\u65f6\u95f4:"), specGroup);
    m_integrationTimeEdit = new QLineEdit(specGroup);
    m_integrationTimeEdit->setObjectName("integrationTimeEdit");
    auto* intUnit = new QLabel("s", specGroup);

    auto* slitLabel = new QLabel(zh(L"\u72ed\u7f1d:"), specGroup);
    m_slitEdit = new QLineEdit(specGroup);
    m_slitEdit->setObjectName("slitEdit");
    auto* slitUnit = new QLabel("um", specGroup);

    auto* avgLabel = new QLabel(zh(L"\u5e73\u5747\u6b21\u6570:"), specGroup);
    m_avgCountEdit = new QLineEdit(specGroup);
    m_avgCountEdit->setObjectName("avgCountEdit");
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

    root->addWidget(specGroup);

    auto* scanGroup = new QGroupBox(zh(L"\u626b\u63cf\u533a\u57df"), this);
    auto* scanGrid = new QGridLayout(scanGroup);
    scanGrid->setContentsMargins(18, 20, 18, 18);
    scanGrid->setHorizontalSpacing(8);
    scanGrid->setVerticalSpacing(12);

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
    auto* xLabel = new QLabel("X\u8f74:", scanGroup);
    m_xCenterEdit = new QLineEdit("1", scanGroup);
    m_xLengthEdit = new QLineEdit("1", scanGroup);
    m_xStepEdit = new QLineEdit("1", scanGroup);
    auto* xUnit = new QLabel("um", scanGroup);

    m_yAxisCheck = new QCheckBox(scanGroup);
    m_yAxisCheck->setChecked(true);
    auto* yLabel = new QLabel("Y\u8f74:", scanGroup);
    m_yCenterEdit = new QLineEdit("1", scanGroup);
    m_yLengthEdit = new QLineEdit("1", scanGroup);
    m_yStepEdit = new QLineEdit("1", scanGroup);
    auto* yUnit = new QLabel("um", scanGroup);

    m_zAxisCheck = new QCheckBox(scanGroup);
    m_zAxisCheck->setChecked(true);
    auto* zLabel = new QLabel("Z\u8f74:", scanGroup);
    m_zCenterEdit = new QLineEdit("1", scanGroup);
    m_zLengthEdit = new QLineEdit("1", scanGroup);
    m_zStepEdit = new QLineEdit("1", scanGroup);
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

    m_readCenterBtn = new QPushButton(zh(L"\u8bfb\u53d6\u4e2d\u5fc3\u70b9"), scanGroup);
    scanGrid->addWidget(m_readCenterBtn, 4, 2, 1, 3);
    scanGrid->setColumnStretch(2, 1);
    scanGrid->setColumnStretch(3, 1);
    scanGrid->setColumnStretch(4, 1);

    root->addWidget(scanGroup);
    root->addStretch();

    connect(m_centerWaveEdit, &QLineEdit::editingFinished, this, &MappingScanDialog::onCenterWaveEditFinished);
    connect(m_integrationTimeEdit, &QLineEdit::editingFinished, this, &MappingScanDialog::onIntegrationTimeEditFinished);
    connect(m_slitEdit, &QLineEdit::editingFinished, this, &MappingScanDialog::onSlitEditFinished);
    connect(m_readCenterBtn, &QPushButton::clicked, this, &MappingScanDialog::onReadCenterPointClicked);
}

void MappingScanDialog::onSlitEditFinished()
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

void MappingScanDialog::onIntegrationTimeEditFinished()
{
    if (!m_main) {
        return;
    }
    if (m_main->m_ccdId < 0) {
        m_main->log("BussiNumber=16 skipped: CCD not connected");
        return;
    }

    bool ok = false;
    const float seconds = m_integrationTimeEdit->text().trimmed().toFloat(&ok);
    if (!ok || seconds <= 0) {
        m_main->log(QString("BussiNumber=16 skipped: invalid exp time \"%1\"").arg(m_integrationTimeEdit->text()));
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

void MappingScanDialog::onCenterWaveEditFinished()
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

void MappingScanDialog::onReadCenterPointClicked()
{
    // TODO: read center point business logic will be implemented later.
}
