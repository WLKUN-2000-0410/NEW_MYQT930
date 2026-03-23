/****************************************************************************
** Meta object code from reading C++ file 'ConnectDialog.h'
**
** Created by: The Qt Meta Object Compiler version 67 (Qt 5.9.0)
**
** WARNING! All changes made in this file will be lost!
*****************************************************************************/

#include "../../../ConnectDialog.h"
#include <QtCore/qbytearray.h>
#include <QtCore/qmetatype.h>
#if !defined(Q_MOC_OUTPUT_REVISION)
#error "The header file 'ConnectDialog.h' doesn't include <QObject>."
#elif Q_MOC_OUTPUT_REVISION != 67
#error "This file was generated using the moc from 5.9.0. It"
#error "cannot be used with the include files from this version of Qt."
#error "(The moc has changed too much.)"
#endif

QT_BEGIN_MOC_NAMESPACE
QT_WARNING_PUSH
QT_WARNING_DISABLE_DEPRECATED
struct qt_meta_stringdata_ConnectDialog_t {
    QByteArrayData data[16];
    char stringdata0[238];
};
#define QT_MOC_LITERAL(idx, ofs, len) \
    Q_STATIC_BYTE_ARRAY_DATA_HEADER_INITIALIZER_WITH_OFFSET(len, \
    qptrdiff(offsetof(qt_meta_stringdata_ConnectDialog_t, stringdata0) + ofs \
        - idx * sizeof(QByteArrayData)) \
    )
static const qt_meta_stringdata_ConnectDialog_t qt_meta_stringdata_ConnectDialog = {
    {
QT_MOC_LITERAL(0, 0, 13), // "ConnectDialog"
QT_MOC_LITERAL(1, 14, 13), // "onSpecConnect"
QT_MOC_LITERAL(2, 28, 0), // ""
QT_MOC_LITERAL(3, 29, 16), // "onSpecDisconnect"
QT_MOC_LITERAL(4, 46, 12), // "onCcdConnect"
QT_MOC_LITERAL(5, 59, 15), // "onCcdDisconnect"
QT_MOC_LITERAL(6, 75, 14), // "onLaserConnect"
QT_MOC_LITERAL(7, 90, 17), // "onLaserDisconnect"
QT_MOC_LITERAL(8, 108, 14), // "onStageConnect"
QT_MOC_LITERAL(9, 123, 17), // "onStageDisconnect"
QT_MOC_LITERAL(10, 141, 14), // "onMotorConnect"
QT_MOC_LITERAL(11, 156, 17), // "onMotorDisconnect"
QT_MOC_LITERAL(12, 174, 15), // "onCameraConnect"
QT_MOC_LITERAL(13, 190, 18), // "onCameraDisconnect"
QT_MOC_LITERAL(14, 209, 12), // "onConnectAll"
QT_MOC_LITERAL(15, 222, 15) // "onDisconnectAll"

    },
    "ConnectDialog\0onSpecConnect\0\0"
    "onSpecDisconnect\0onCcdConnect\0"
    "onCcdDisconnect\0onLaserConnect\0"
    "onLaserDisconnect\0onStageConnect\0"
    "onStageDisconnect\0onMotorConnect\0"
    "onMotorDisconnect\0onCameraConnect\0"
    "onCameraDisconnect\0onConnectAll\0"
    "onDisconnectAll"
};
#undef QT_MOC_LITERAL

static const uint qt_meta_data_ConnectDialog[] = {

 // content:
       7,       // revision
       0,       // classname
       0,    0, // classinfo
      14,   14, // methods
       0,    0, // properties
       0,    0, // enums/sets
       0,    0, // constructors
       0,       // flags
       0,       // signalCount

 // slots: name, argc, parameters, tag, flags
       1,    0,   84,    2, 0x08 /* Private */,
       3,    0,   85,    2, 0x08 /* Private */,
       4,    0,   86,    2, 0x08 /* Private */,
       5,    0,   87,    2, 0x08 /* Private */,
       6,    0,   88,    2, 0x08 /* Private */,
       7,    0,   89,    2, 0x08 /* Private */,
       8,    0,   90,    2, 0x08 /* Private */,
       9,    0,   91,    2, 0x08 /* Private */,
      10,    0,   92,    2, 0x08 /* Private */,
      11,    0,   93,    2, 0x08 /* Private */,
      12,    0,   94,    2, 0x08 /* Private */,
      13,    0,   95,    2, 0x08 /* Private */,
      14,    0,   96,    2, 0x08 /* Private */,
      15,    0,   97,    2, 0x08 /* Private */,

 // slots: parameters
    QMetaType::Void,
    QMetaType::Void,
    QMetaType::Void,
    QMetaType::Void,
    QMetaType::Void,
    QMetaType::Void,
    QMetaType::Void,
    QMetaType::Void,
    QMetaType::Void,
    QMetaType::Void,
    QMetaType::Void,
    QMetaType::Void,
    QMetaType::Void,
    QMetaType::Void,

       0        // eod
};

void ConnectDialog::qt_static_metacall(QObject *_o, QMetaObject::Call _c, int _id, void **_a)
{
    if (_c == QMetaObject::InvokeMetaMethod) {
        ConnectDialog *_t = static_cast<ConnectDialog *>(_o);
        Q_UNUSED(_t)
        switch (_id) {
        case 0: _t->onSpecConnect(); break;
        case 1: _t->onSpecDisconnect(); break;
        case 2: _t->onCcdConnect(); break;
        case 3: _t->onCcdDisconnect(); break;
        case 4: _t->onLaserConnect(); break;
        case 5: _t->onLaserDisconnect(); break;
        case 6: _t->onStageConnect(); break;
        case 7: _t->onStageDisconnect(); break;
        case 8: _t->onMotorConnect(); break;
        case 9: _t->onMotorDisconnect(); break;
        case 10: _t->onCameraConnect(); break;
        case 11: _t->onCameraDisconnect(); break;
        case 12: _t->onConnectAll(); break;
        case 13: _t->onDisconnectAll(); break;
        default: ;
        }
    }
    Q_UNUSED(_a);
}

const QMetaObject ConnectDialog::staticMetaObject = {
    { &QDialog::staticMetaObject, qt_meta_stringdata_ConnectDialog.data,
      qt_meta_data_ConnectDialog,  qt_static_metacall, nullptr, nullptr}
};


const QMetaObject *ConnectDialog::metaObject() const
{
    return QObject::d_ptr->metaObject ? QObject::d_ptr->dynamicMetaObject() : &staticMetaObject;
}

void *ConnectDialog::qt_metacast(const char *_clname)
{
    if (!_clname) return nullptr;
    if (!strcmp(_clname, qt_meta_stringdata_ConnectDialog.stringdata0))
        return static_cast<void*>(const_cast< ConnectDialog*>(this));
    return QDialog::qt_metacast(_clname);
}

int ConnectDialog::qt_metacall(QMetaObject::Call _c, int _id, void **_a)
{
    _id = QDialog::qt_metacall(_c, _id, _a);
    if (_id < 0)
        return _id;
    if (_c == QMetaObject::InvokeMetaMethod) {
        if (_id < 14)
            qt_static_metacall(this, _c, _id, _a);
        _id -= 14;
    } else if (_c == QMetaObject::RegisterMethodArgumentMetaType) {
        if (_id < 14)
            *reinterpret_cast<int*>(_a[0]) = -1;
        _id -= 14;
    }
    return _id;
}
QT_WARNING_POP
QT_END_MOC_NAMESPACE
