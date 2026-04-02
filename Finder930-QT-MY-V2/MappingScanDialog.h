#pragma once

#include <QDialog>
#include <QString>
#include <QVector>

class QCheckBox;
class QComboBox;
class QLineEdit;
class QPushButton;
class QStackedWidget;
class QTextEdit;
class QCustomPlot;
class QCPColorMap;
class QCPColorScale;
class Finder930QTMYV2;

class MappingScanDialog : public QDialog
{
    Q_OBJECT

public:
    explicit MappingScanDialog(QWidget* parent = nullptr);

private slots:
    void onCenterWaveEditFinished();
    void onIntegrationTimeEditFinished();
    void onSlitEditFinished();
    void onReadCenterPointClicked();
    void onStartClicked();
    void onStopClicked();
    void onDisplayModeChanged(int index);

private:
    void mapLog(const QString& msg);

    struct MappingRunContext {
        float wavelen = 0.0f;
        QString unit = "nm";
        float expTimeSec = 0.0f;
        int slitUm = 0;
        int times = 1;
        int strMode = 0;
        float dWave0 = 0.0f;
        float dWave1 = 0.0f;

        bool xEnabled = false;
        bool yEnabled = false;
        bool zEnabled = false;

        double xCenterPos = 0.0;
        double yCenterPos = 0.0;
        double zCenterPos = 0.0;
        double xLength = 0.0;
        double yLength = 0.0;
        double zLength = 0.0;
        double xStep = 0.0;
        double yStep = 0.0;
        double zStep = 0.0;

        int pointNumX = 1;
        int pointNumY = 1;
        int pointNumZ = 1;
        int setpMode = 0;
        int scanMode = 0;
        int nNMCN = 0;
        float fLaserWave = 0.0f;

        QString saveFilePath;
    };

    Finder930QTMYV2* m_main = nullptr;
    MappingRunContext m_runCtx;
    bool m_runCtxValid = false;
    bool m_stopRequested = false;
    QVector<double> m_initXWaves;
    int m_initXPixels = 0;

    QLineEdit* m_centerWaveEdit = nullptr;
    QLineEdit* m_integrationTimeEdit = nullptr;
    QLineEdit* m_slitEdit = nullptr;
    QLineEdit* m_avgCountEdit = nullptr;

    QCheckBox* m_xAxisCheck = nullptr;
    QCheckBox* m_yAxisCheck = nullptr;
    QCheckBox* m_zAxisCheck = nullptr;

    QLineEdit* m_xCenterEdit = nullptr;
    QLineEdit* m_xLengthEdit = nullptr;
    QLineEdit* m_xStepEdit = nullptr;

    QLineEdit* m_yCenterEdit = nullptr;
    QLineEdit* m_yLengthEdit = nullptr;
    QLineEdit* m_yStepEdit = nullptr;

    QLineEdit* m_zCenterEdit = nullptr;
    QLineEdit* m_zLengthEdit = nullptr;
    QLineEdit* m_zStepEdit = nullptr;

    QPushButton* m_readCenterBtn = nullptr;
    QPushButton* m_startBtn = nullptr;
    QPushButton* m_stopBtn = nullptr;

    QComboBox* m_displayTypeCombo = nullptr;
    QStackedWidget* m_displayParamStack = nullptr;
    QLineEdit* m_singleNmEdit = nullptr;
    QLineEdit* m_integralNmStartEdit = nullptr;
    QLineEdit* m_integralNmEndEdit = nullptr;
    QLineEdit* m_fwhmNmLeftEdit = nullptr;
    QLineEdit* m_fwhmNmRightEdit = nullptr;

    QTextEdit* m_logEdit = nullptr;
    QCustomPlot* m_heatmapPlot = nullptr;
    QCPColorMap* m_heatmapColorMap = nullptr;
    QCPColorScale* m_heatmapColorScale = nullptr;
};
