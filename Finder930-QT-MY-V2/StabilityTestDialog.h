#pragma once

#include <QDialog>
#include <QString>
#include <QVector>
#include <atomic>
#include <thread>

class QCustomPlot;
class QComboBox;
class QCheckBox;
class QLineEdit;
class QPushButton;
class Finder930QTMYV2;

class StabilityTestDialog : public QDialog
{
    Q_OBJECT
public:
    explicit StabilityTestDialog(QWidget* parent = nullptr);
    ~StabilityTestDialog();

signals:
    void acqResultReady(QVector<double> xData, QVector<double> yData, int round);

private slots:
    void onTestModeChanged(const QString& modeText);
    void onExcitationWaveChanged(const QString& waveText);
    void onPowerChanged(const QString& powerText);
    void onPinholeChanged(const QString& pinholeText);
    void onGratingChanged(const QString& gratingText);
    void onSlitEditFinished();
    void onExpTimeEditFinished();
    void onCenterWaveEditFinished();
    void onStartClicked();
    void onStopClicked();

private:
    Finder930QTMYV2* m_main = nullptr;
    QCustomPlot* m_plot = nullptr;
    QComboBox* m_modeCombo = nullptr;
    QComboBox* m_excCombo = nullptr;
    QComboBox* m_powerCombo = nullptr;
    QComboBox* m_pinholeCombo = nullptr;
    QComboBox* m_gratingCombo = nullptr;
    QLineEdit* m_slitEdit = nullptr;
    QLineEdit* m_expTimeEdit = nullptr;
    QLineEdit* m_centerWaveEdit = nullptr;
    QLineEdit* m_avgCountEdit = nullptr;
    QCheckBox* m_intervalCheck = nullptr;
    QLineEdit* m_intervalTimeEdit = nullptr;
    QLineEdit* m_intervalCountEdit = nullptr;
    QLineEdit* m_specFromEdit = nullptr;
    QLineEdit* m_specToEdit = nullptr;
    QWidget* m_stabilitySection = nullptr;
    QWidget* m_spectrumSection = nullptr;
    QPushButton* m_startBtn = nullptr;
    QPushButton* m_stopBtn = nullptr;
    QString m_lastExcWave = "none";

    int m_xPixels = 0;
    QVector<float> m_xWavelengths;
    QString m_spectrumExcWave;
    QString m_spectrumPower;
    QString m_spectrumGrating;
    float m_spectrumFromNm = 0.0f;
    float m_spectrumToNm = 0.0f;
    float m_spectrumExpSec = 0.0f;
    int m_spectrumAvgCount = 1;
    int m_spectrumTurret = 0;
    int m_spectrumGratingIndex = 0;
    int m_spectrumWaveNum = 0;
    int m_spectrumWaveIndex = 0;
    QVector<double> m_spectrumCoeff;
    QVector<int> m_spectrumWaveCenters;
    QVector<float> m_spectrumCenters;
    std::atomic<bool> m_running{ false };
    std::thread m_acqThread;

    void initSpectrumPlot();
};
