/********************************************************************************
** Form generated from reading UI file 'Finder930QTMYV2.ui'
**
** Created by: Qt User Interface Compiler version 5.9.0
**
** WARNING! All changes made in this file will be lost when recompiling UI file!
********************************************************************************/

#ifndef UI_FINDER930QTMYV2_H
#define UI_FINDER930QTMYV2_H

#include <QtCore/QVariant>
#include <QtWidgets/QAction>
#include <QtWidgets/QApplication>
#include <QtWidgets/QButtonGroup>
#include <QtWidgets/QHeaderView>
#include <QtWidgets/QMainWindow>
#include <QtWidgets/QMenuBar>
#include <QtWidgets/QPushButton>
#include <QtWidgets/QStatusBar>
#include <QtWidgets/QTextEdit>
#include <QtWidgets/QToolBar>
#include <QtWidgets/QWidget>

QT_BEGIN_NAMESPACE

class Ui_Finder930QTMYV2Class
{
public:
    QWidget *centralWidget;
    QTextEdit *logTextEdit;
    QPushButton *connectBtn;
    QPushButton *StableTest;
    QMenuBar *menuBar;
    QToolBar *mainToolBar;
    QStatusBar *statusBar;

    void setupUi(QMainWindow *Finder930QTMYV2Class)
    {
        if (Finder930QTMYV2Class->objectName().isEmpty())
            Finder930QTMYV2Class->setObjectName(QStringLiteral("Finder930QTMYV2Class"));
        Finder930QTMYV2Class->resize(942, 787);
        centralWidget = new QWidget(Finder930QTMYV2Class);
        centralWidget->setObjectName(QStringLiteral("centralWidget"));
        logTextEdit = new QTextEdit(centralWidget);
        logTextEdit->setObjectName(QStringLiteral("logTextEdit"));
        logTextEdit->setGeometry(QRect(60, 420, 831, 281));
        connectBtn = new QPushButton(centralWidget);
        connectBtn->setObjectName(QStringLiteral("connectBtn"));
        connectBtn->setGeometry(QRect(70, 30, 821, 51));
        StableTest = new QPushButton(centralWidget);
        StableTest->setObjectName(QStringLiteral("StableTest"));
        StableTest->setGeometry(QRect(70, 100, 141, 61));
        Finder930QTMYV2Class->setCentralWidget(centralWidget);
        menuBar = new QMenuBar(Finder930QTMYV2Class);
        menuBar->setObjectName(QStringLiteral("menuBar"));
        menuBar->setGeometry(QRect(0, 0, 942, 29));
        Finder930QTMYV2Class->setMenuBar(menuBar);
        mainToolBar = new QToolBar(Finder930QTMYV2Class);
        mainToolBar->setObjectName(QStringLiteral("mainToolBar"));
        Finder930QTMYV2Class->addToolBar(Qt::TopToolBarArea, mainToolBar);
        statusBar = new QStatusBar(Finder930QTMYV2Class);
        statusBar->setObjectName(QStringLiteral("statusBar"));
        Finder930QTMYV2Class->setStatusBar(statusBar);

        retranslateUi(Finder930QTMYV2Class);

        QMetaObject::connectSlotsByName(Finder930QTMYV2Class);
    } // setupUi

    void retranslateUi(QMainWindow *Finder930QTMYV2Class)
    {
        Finder930QTMYV2Class->setWindowTitle(QApplication::translate("Finder930QTMYV2Class", "Finder930QTMYV2", Q_NULLPTR));
        connectBtn->setText(QApplication::translate("Finder930QTMYV2Class", "Connect", Q_NULLPTR));
        StableTest->setText(QApplication::translate("Finder930QTMYV2Class", "StableTest", Q_NULLPTR));
    } // retranslateUi

};

namespace Ui {
    class Finder930QTMYV2Class: public Ui_Finder930QTMYV2Class {};
} // namespace Ui

QT_END_NAMESPACE

#endif // UI_FINDER930QTMYV2_H
