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
    QMenuBar *menuBar;
    QToolBar *mainToolBar;
    QStatusBar *statusBar;

    void setupUi(QMainWindow *Finder930QTMYV2Class)
    {
        if (Finder930QTMYV2Class->objectName().isEmpty())
            Finder930QTMYV2Class->setObjectName(QStringLiteral("Finder930QTMYV2Class"));
        Finder930QTMYV2Class->resize(886, 673);
        centralWidget = new QWidget(Finder930QTMYV2Class);
        centralWidget->setObjectName(QStringLiteral("centralWidget"));
        logTextEdit = new QTextEdit(centralWidget);
        logTextEdit->setObjectName(QStringLiteral("logTextEdit"));
        logTextEdit->setGeometry(QRect(30, 330, 831, 281));
        connectBtn = new QPushButton(centralWidget);
        connectBtn->setObjectName(QStringLiteral("connectBtn"));
        connectBtn->setGeometry(QRect(50, 70, 80, 20));
        Finder930QTMYV2Class->setCentralWidget(centralWidget);
        menuBar = new QMenuBar(Finder930QTMYV2Class);
        menuBar->setObjectName(QStringLiteral("menuBar"));
        menuBar->setGeometry(QRect(0, 0, 886, 25));
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
    } // retranslateUi

};

namespace Ui {
    class Finder930QTMYV2Class: public Ui_Finder930QTMYV2Class {};
} // namespace Ui

QT_END_NAMESPACE

#endif // UI_FINDER930QTMYV2_H
