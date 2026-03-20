#pragma once

#include <QDialog>

class QCustomPlot;

class StabilityTestDialog : public QDialog
{
public:
    explicit StabilityTestDialog(QWidget* parent = nullptr);

private:
    QCustomPlot* m_plot = nullptr;  //图标控件
    void initSpectrumPlot();        //初始化图表
};
