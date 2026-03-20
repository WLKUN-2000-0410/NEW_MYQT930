#include "StabilityTestDialog.h"

#include <QComboBox>
#include <QFrame>
#include <QHBoxLayout>
#include <QLabel>
#include <QLineEdit>
#include <QPushButton>
#include <QVBoxLayout>
#include <cmath>
#include "Finder930QTMYV2.h"
#include "qcustomplot.h"

StabilityTestDialog::StabilityTestDialog(QWidget* parent)
    : QDialog(parent)
{
    setWindowTitle("Stability Test");
    setModal(true);
    resize(1260, 760);

    auto* rootLayout = new QHBoxLayout(this);
    rootLayout->setContentsMargins(10, 10, 10, 10);
    rootLayout->setSpacing(10);
    auto* mainWin = qobject_cast<Finder930QTMYV2*>(parent);

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
    auto* excCombo = new QComboBox(leftPanel);
    excCombo->addItems(QStringList{ "none", "532", "638", "785" });
    excCombo->setCurrentText("none");
    if (mainWin) {
        const QString w = mainWin->m_excWave.trimmed().toLower();
        if (w == "532" || w == "638" || w == "785" || w == "none") {
            excCombo->setCurrentText(w);
        }
    }
    excCombo->setStyleSheet(
        "QComboBox{background:#ffffff;color:#222222;border:1px solid #cfd3d9;border-radius:4px;padding:4px 6px;}"
        "QComboBox::drop-down{border:0;}"
        "QComboBox QAbstractItemView{background:#ffffff;color:#222222;selection-background-color:#dfe8ff;}");
    leftLayout->addWidget(excLabel);
    leftLayout->addWidget(excCombo);

    addField("Power (mW)", "5");
    addField("Slit (um)", "100");
    addField("Integration (s)", "1");
    addField("Center Wave (nm)", "550");
    addField("Average Count", "1");
    addField("Sample Count", "1");

    leftLayout->addStretch();

    auto* closeBtn = new QPushButton("Close", leftPanel);
    closeBtn->setMinimumHeight(36);
    closeBtn->setStyleSheet("QPushButton{background:#eef1f5;color:#1f2328;border:1px solid #c5cad1;border-radius:4px;}"
        "QPushButton:hover{background:#e3e8ef;}");
    leftLayout->addWidget(closeBtn);
    connect(closeBtn, &QPushButton::clicked, this, &QDialog::accept);

    m_plot = new QCustomPlot(this);
    initSpectrumPlot();

    rootLayout->addWidget(leftPanel);
    rootLayout->addWidget(m_plot, 1);
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
