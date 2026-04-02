#pragma once

#include <QDialog>

class QCustomPlot;

class HeatmapTestDialog : public QDialog
{
    Q_OBJECT

public:
    explicit HeatmapTestDialog(QWidget* parent = nullptr);

private:
    QCustomPlot* m_plot = nullptr;
};
