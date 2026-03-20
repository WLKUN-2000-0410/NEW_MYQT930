#pragma once

#include <QDialog>
#include <QString>

class QCustomPlot;
class QComboBox;
class Finder930QTMYV2;

class StabilityTestDialog : public QDialog
{
public:
    explicit StabilityTestDialog(QWidget* parent = nullptr);

private:
    void onExcitationWaveChanged(const QString& waveText);
private:
    Finder930QTMYV2* m_main = nullptr;
    QCustomPlot* m_plot = nullptr;  // chart widget
    QComboBox* m_excCombo = nullptr;
    QComboBox* m_powerCombo = nullptr;
    QString m_lastExcWave = "none";
    void initSpectrumPlot();
};
