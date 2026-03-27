#pragma once

#include <QDialog>

class QCheckBox;
class QLineEdit;
class QPushButton;
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

private:
    Finder930QTMYV2* m_main = nullptr;
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
};
