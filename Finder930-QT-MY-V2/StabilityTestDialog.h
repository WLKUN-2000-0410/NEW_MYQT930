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
    QPushButton* m_startBtn = nullptr;
    QPushButton* m_stopBtn = nullptr;
    QString m_lastExcWave = "none";

    int m_xPixels = 0;
    QVector<float> m_xWavelengths;
    std::atomic<bool> m_running{ false };
    std::thread m_acqThread;

    void initSpectrumPlot();
};
