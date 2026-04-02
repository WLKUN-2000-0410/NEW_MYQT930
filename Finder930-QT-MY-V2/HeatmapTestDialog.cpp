#include "HeatmapTestDialog.h"

#include "qcustomplot.h"

#include <QDateTime>
#include <QtGlobal>
#include <QVBoxLayout>

HeatmapTestDialog::HeatmapTestDialog(QWidget* parent)
    : QDialog(parent)
{
    setWindowTitle("Heatmap Test (Temporary)");
    resize(900, 620);
    setMinimumSize(780, 520);

    auto* layout = new QVBoxLayout(this);
    layout->setContentsMargins(6, 6, 6, 6);

    m_plot = new QCustomPlot(this);
    layout->addWidget(m_plot);

    m_plot->plotLayout()->clear();
    auto* axisRect = new QCPAxisRect(m_plot);
    auto* colorScale = new QCPColorScale(m_plot);
    m_plot->plotLayout()->addElement(0, 0, axisRect);
    m_plot->plotLayout()->addElement(0, 1, colorScale);
    m_plot->plotLayout()->setColumnStretchFactor(0, 18);
    m_plot->plotLayout()->setColumnStretchFactor(1, 1);

    m_plot->setBackground(QColor(20, 20, 20));
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

    colorScale->setType(QCPAxis::atRight);
    colorScale->axis()->setTickLabelColor(Qt::white);
    colorScale->axis()->setBasePen(QPen(Qt::white));
    colorScale->axis()->setTickPen(QPen(Qt::white));
    colorScale->axis()->setSubTickPen(QPen(Qt::white));

    auto* colorMap = new QCPColorMap(axisRect->axis(QCPAxis::atBottom), axisRect->axis(QCPAxis::atLeft));
    colorMap->setColorScale(colorScale);
    colorMap->setGradient(QCPColorGradient::gpPolar);
    colorMap->setInterpolate(false);

    const int gridSize = 11;
    colorMap->data()->setSize(gridSize, gridSize);
    colorMap->data()->setRange(QCPRange(1, gridSize), QCPRange(1, gridSize));

    const double vMin = 263.7;
    const double vMax = 276.5;
    qsrand(static_cast<uint>(QDateTime::currentMSecsSinceEpoch() & 0xffffffff));
    for (int x = 0; x < gridSize; ++x) {
        for (int y = 0; y < gridSize; ++y) {
            const double r = static_cast<double>(qrand()) / static_cast<double>(RAND_MAX);
            const double value = vMin + r * (vMax - vMin);
            colorMap->data()->setCell(x, y, value);
        }
    }
    colorMap->rescaleDataRange(true);

    axisRect->axis(QCPAxis::atBottom)->setRange(1, gridSize);
    axisRect->axis(QCPAxis::atLeft)->setRange(1, gridSize);
    axisRect->axis(QCPAxis::atBottom)->setLabel("X");
    axisRect->axis(QCPAxis::atLeft)->setLabel("Y");
    axisRect->axis(QCPAxis::atBottom)->grid()->setVisible(false);
    axisRect->axis(QCPAxis::atLeft)->grid()->setVisible(false);

    m_plot->replot();
}
