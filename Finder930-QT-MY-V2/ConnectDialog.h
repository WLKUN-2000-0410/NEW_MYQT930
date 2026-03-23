#pragma once
#include <windows.h>
#include <QDialog>

class QPushButton;
class QLabel;
class Finder930QTMYV2;

class ConnectDialog : public QDialog
{
    Q_OBJECT
public:
    ConnectDialog(Finder930QTMYV2* mainWin, QWidget* parent = nullptr);

private slots:
    void onSpecConnect();
    void onSpecDisconnect();
    void onCcdConnect();
    void onCcdDisconnect();
    void onLaserConnect();
    void onLaserDisconnect();
    void onStageConnect();
    void onStageDisconnect();
    void onMotorConnect();
    void onMotorDisconnect();
    void onCameraConnect();
    void onCameraDisconnect();
    void onConnectAll();
    void onDisconnectAll();


private:
    Finder930QTMYV2* m_main;
private:                                                                     
       QPushButton* m_specConnBtn;
       QPushButton* m_specDiscBtn;
       QPushButton* m_ccdConnBtn;
       QPushButton* m_ccdDiscBtn;
       QPushButton* m_laserConnBtn;
       QPushButton* m_laserDiscBtn;
       QPushButton* m_stageConnBtn;
       QPushButton* m_stageDiscBtn;
       QPushButton* m_motorConnBtn;
       QPushButton* m_motorDiscBtn;
       QPushButton* m_cameraConnBtn;
       QPushButton* m_cameraDiscBtn;
       QPushButton* m_allConnBtn;
       QPushButton* m_allDiscBtn;
};
