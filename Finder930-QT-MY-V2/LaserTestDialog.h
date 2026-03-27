#pragma once

#include <QDialog>

class QComboBox;
class QLineEdit;
class QPushButton;
class QTextEdit;
class QString;
class Finder930QTMYV2;

class LaserTestDialog : public QDialog
{
    Q_OBJECT

public:
    explicit LaserTestDialog(QWidget* parent = nullptr);

private slots:
    void onSetTotalStepsClicked();
    void onGetTotalStepsClicked();
    void onSetMinSpeedClicked();
    void onGetMinSpeedClicked();
    void onSetMaxSpeedClicked();
    void onGetMaxSpeedClicked();
    void onToHomeClicked();
    void onGetPosClicked();
    void onSetDebugStepClicked();

private:
    void appendLog(const QString& msg);
    int currentMotorId() const;
    bool ensureLaserApiReady();

    Finder930QTMYV2* m_main = nullptr;
    QComboBox* m_motorIdCombo = nullptr;

    QLineEdit* m_totalStepsInput = nullptr;
    QPushButton* m_setTotalStepsBtn = nullptr;
    QPushButton* m_getTotalStepsBtn = nullptr;
    QLineEdit* m_totalStepsReadback = nullptr;

    QLineEdit* m_minSpeedInput = nullptr;
    QPushButton* m_setMinSpeedBtn = nullptr;
    QPushButton* m_getMinSpeedBtn = nullptr;
    QLineEdit* m_minSpeedReadback = nullptr;

    QLineEdit* m_maxSpeedInput = nullptr;
    QPushButton* m_setMaxSpeedBtn = nullptr;
    QPushButton* m_getMaxSpeedBtn = nullptr;
    QLineEdit* m_maxSpeedReadback = nullptr;

    QPushButton* m_toHomeBtn = nullptr;

    QPushButton* m_getPosBtn = nullptr;
    QLineEdit* m_posReadback = nullptr;
    QLineEdit* m_stepReadback = nullptr;

    QLineEdit* m_debugStepInput = nullptr;
    QPushButton* m_setDebugStepBtn = nullptr;

    QTextEdit* m_hintLog = nullptr;
};
