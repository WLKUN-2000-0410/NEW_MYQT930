#pragma once
#include <windows.h>
#include <QtWidgets/QMainWindow>
#include <QString>
#include "ui_Finder930QTMYV2.h"

class ConnectDialog;
class QTimer;

class Finder930QTMYV2 : public QMainWindow
{
    Q_OBJECT

public:
    Finder930QTMYV2(QWidget* parent = nullptr);
    ~Finder930QTMYV2();

    // Spectrometer
    HMODULE m_hSpecDll = nullptr;
    int m_specHandle = -1;

    // CCD (Andor)
    HMODULE m_hDfieldDll = nullptr;
    int m_ccdId = -1;

    // Laser
    HMODULE m_hLaserDll = nullptr;
    bool m_laserConnected = false;

    // Stage
    HMODULE m_hStageDll = nullptr;
    void* m_stageHandle = nullptr;

    double m_maxRangeX = 0.0;
    double m_maxRangeY = 0.0;

    // Motor (光路电机)      
     HMODULE m_hMotorDll = nullptr;
    bool m_motorConnected = false;

    // Camera (ST500)
    HMODULE m_hCameraDll = nullptr;
    bool m_cameraConnected = false;



public:
    void log(const QString& msg);
    void onCcdConnectionChanged(bool connected);
private slots:
    void onConnect();
    void updateCcdTemperature();

private:
    bool readCcdTemperature(double& outTempC) const;
    void resetTitle();

    Ui::Finder930QTMYV2Class ui;
    QString m_baseTitle;
    QTimer* m_ccdTempTimer = nullptr;
};
