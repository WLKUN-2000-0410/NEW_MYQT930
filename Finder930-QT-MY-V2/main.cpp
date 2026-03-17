#include "Finder930QTMYV2.h"
#include <QtWidgets/QApplication>
#include <QCoreApplication>
#include <QDir>

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

    QDir::setCurrent(QCoreApplication::applicationDirPath());

    Finder930QTMYV2 window;
    window.show();
    return app.exec();
}
