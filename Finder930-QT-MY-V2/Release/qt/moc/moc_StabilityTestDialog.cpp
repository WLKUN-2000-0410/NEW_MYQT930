/****************************************************************************
** Meta object code from reading C++ file 'StabilityTestDialog.h'
**
** Created by: The Qt Meta Object Compiler version 67 (Qt 5.9.0)
**
** WARNING! All changes made in this file will be lost!
*****************************************************************************/

#include "../../../StabilityTestDialog.h"
#include <QtCore/qbytearray.h>
#include <QtCore/qmetatype.h>
#include <QtCore/QVector>
#if !defined(Q_MOC_OUTPUT_REVISION)
#error "The header file 'StabilityTestDialog.h' doesn't include <QObject>."
#elif Q_MOC_OUTPUT_REVISION != 67
#error "This file was generated using the moc from 5.9.0. It"
#error "cannot be used with the include files from this version of Qt."
#error "(The moc has changed too much.)"
#endif

QT_BEGIN_MOC_NAMESPACE
QT_WARNING_PUSH
QT_WARNING_DISABLE_DEPRECATED
struct qt_meta_stringdata_StabilityTestDialog_t {
    QByteArrayData data[20];
    char stringdata0[281];
};
#define QT_MOC_LITERAL(idx, ofs, len) \
    Q_STATIC_BYTE_ARRAY_DATA_HEADER_INITIALIZER_WITH_OFFSET(len, \
    qptrdiff(offsetof(qt_meta_stringdata_StabilityTestDialog_t, stringdata0) + ofs \
        - idx * sizeof(QByteArrayData)) \
    )
static const qt_meta_stringdata_StabilityTestDialog_t qt_meta_stringdata_StabilityTestDialog = {
    {
QT_MOC_LITERAL(0, 0, 19), // "StabilityTestDialog"
QT_MOC_LITERAL(1, 20, 14), // "acqResultReady"
QT_MOC_LITERAL(2, 35, 0), // ""
QT_MOC_LITERAL(3, 36, 15), // "QVector<double>"
QT_MOC_LITERAL(4, 52, 5), // "xData"
QT_MOC_LITERAL(5, 58, 5), // "yData"
QT_MOC_LITERAL(6, 64, 5), // "round"
QT_MOC_LITERAL(7, 70, 23), // "onExcitationWaveChanged"
QT_MOC_LITERAL(8, 94, 8), // "waveText"
QT_MOC_LITERAL(9, 103, 14), // "onPowerChanged"
QT_MOC_LITERAL(10, 118, 9), // "powerText"
QT_MOC_LITERAL(11, 128, 16), // "onPinholeChanged"
QT_MOC_LITERAL(12, 145, 11), // "pinholeText"
QT_MOC_LITERAL(13, 157, 16), // "onGratingChanged"
QT_MOC_LITERAL(14, 174, 11), // "gratingText"
QT_MOC_LITERAL(15, 186, 18), // "onSlitEditFinished"
QT_MOC_LITERAL(16, 205, 21), // "onExpTimeEditFinished"
QT_MOC_LITERAL(17, 227, 24), // "onCenterWaveEditFinished"
QT_MOC_LITERAL(18, 252, 14), // "onStartClicked"
QT_MOC_LITERAL(19, 267, 13) // "onStopClicked"

    },
    "StabilityTestDialog\0acqResultReady\0\0"
    "QVector<double>\0xData\0yData\0round\0"
    "onExcitationWaveChanged\0waveText\0"
    "onPowerChanged\0powerText\0onPinholeChanged\0"
    "pinholeText\0onGratingChanged\0gratingText\0"
    "onSlitEditFinished\0onExpTimeEditFinished\0"
    "onCenterWaveEditFinished\0onStartClicked\0"
    "onStopClicked"
};
#undef QT_MOC_LITERAL

static const uint qt_meta_data_StabilityTestDialog[] = {

 // content:
       7,       // revision
       0,       // classname
       0,    0, // classinfo
      10,   14, // methods
       0,    0, // properties
       0,    0, // enums/sets
       0,    0, // constructors
       0,       // flags
       1,       // signalCount

 // signals: name, argc, parameters, tag, flags
       1,    3,   64,    2, 0x06 /* Public */,

 // slots: name, argc, parameters, tag, flags
       7,    1,   71,    2, 0x08 /* Private */,
       9,    1,   74,    2, 0x08 /* Private */,
      11,    1,   77,    2, 0x08 /* Private */,
      13,    1,   80,    2, 0x08 /* Private */,
      15,    0,   83,    2, 0x08 /* Private */,
      16,    0,   84,    2, 0x08 /* Private */,
      17,    0,   85,    2, 0x08 /* Private */,
      18,    0,   86,    2, 0x08 /* Private */,
      19,    0,   87,    2, 0x08 /* Private */,

 // signals: parameters
    QMetaType::Void, 0x80000000 | 3, 0x80000000 | 3, QMetaType::Int,    4,    5,    6,

 // slots: parameters
    QMetaType::Void, QMetaType::QString,    8,
    QMetaType::Void, QMetaType::QString,   10,
    QMetaType::Void, QMetaType::QString,   12,
    QMetaType::Void, QMetaType::QString,   14,
    QMetaType::Void,
    QMetaType::Void,
    QMetaType::Void,
    QMetaType::Void,
    QMetaType::Void,

       0        // eod
};

void StabilityTestDialog::qt_static_metacall(QObject *_o, QMetaObject::Call _c, int _id, void **_a)
{
    if (_c == QMetaObject::InvokeMetaMethod) {
        StabilityTestDialog *_t = static_cast<StabilityTestDialog *>(_o);
        Q_UNUSED(_t)
        switch (_id) {
        case 0: _t->acqResultReady((*reinterpret_cast< QVector<double>(*)>(_a[1])),(*reinterpret_cast< QVector<double>(*)>(_a[2])),(*reinterpret_cast< int(*)>(_a[3]))); break;
        case 1: _t->onExcitationWaveChanged((*reinterpret_cast< const QString(*)>(_a[1]))); break;
        case 2: _t->onPowerChanged((*reinterpret_cast< const QString(*)>(_a[1]))); break;
        case 3: _t->onPinholeChanged((*reinterpret_cast< const QString(*)>(_a[1]))); break;
        case 4: _t->onGratingChanged((*reinterpret_cast< const QString(*)>(_a[1]))); break;
        case 5: _t->onSlitEditFinished(); break;
        case 6: _t->onExpTimeEditFinished(); break;
        case 7: _t->onCenterWaveEditFinished(); break;
        case 8: _t->onStartClicked(); break;
        case 9: _t->onStopClicked(); break;
        default: ;
        }
    } else if (_c == QMetaObject::RegisterMethodArgumentMetaType) {
        switch (_id) {
        default: *reinterpret_cast<int*>(_a[0]) = -1; break;
        case 0:
            switch (*reinterpret_cast<int*>(_a[1])) {
            default: *reinterpret_cast<int*>(_a[0]) = -1; break;
            case 1:
            case 0:
                *reinterpret_cast<int*>(_a[0]) = qRegisterMetaType< QVector<double> >(); break;
            }
            break;
        }
    } else if (_c == QMetaObject::IndexOfMethod) {
        int *result = reinterpret_cast<int *>(_a[0]);
        void **func = reinterpret_cast<void **>(_a[1]);
        {
            typedef void (StabilityTestDialog::*_t)(QVector<double> , QVector<double> , int );
            if (*reinterpret_cast<_t *>(func) == static_cast<_t>(&StabilityTestDialog::acqResultReady)) {
                *result = 0;
                return;
            }
        }
    }
}

const QMetaObject StabilityTestDialog::staticMetaObject = {
    { &QDialog::staticMetaObject, qt_meta_stringdata_StabilityTestDialog.data,
      qt_meta_data_StabilityTestDialog,  qt_static_metacall, nullptr, nullptr}
};


const QMetaObject *StabilityTestDialog::metaObject() const
{
    return QObject::d_ptr->metaObject ? QObject::d_ptr->dynamicMetaObject() : &staticMetaObject;
}

void *StabilityTestDialog::qt_metacast(const char *_clname)
{
    if (!_clname) return nullptr;
    if (!strcmp(_clname, qt_meta_stringdata_StabilityTestDialog.stringdata0))
        return static_cast<void*>(const_cast< StabilityTestDialog*>(this));
    return QDialog::qt_metacast(_clname);
}

int StabilityTestDialog::qt_metacall(QMetaObject::Call _c, int _id, void **_a)
{
    _id = QDialog::qt_metacall(_c, _id, _a);
    if (_id < 0)
        return _id;
    if (_c == QMetaObject::InvokeMetaMethod) {
        if (_id < 10)
            qt_static_metacall(this, _c, _id, _a);
        _id -= 10;
    } else if (_c == QMetaObject::RegisterMethodArgumentMetaType) {
        if (_id < 10)
            qt_static_metacall(this, _c, _id, _a);
        _id -= 10;
    }
    return _id;
}

// SIGNAL 0
void StabilityTestDialog::acqResultReady(QVector<double> _t1, QVector<double> _t2, int _t3)
{
    void *_a[] = { nullptr, const_cast<void*>(reinterpret_cast<const void*>(&_t1)), const_cast<void*>(reinterpret_cast<const void*>(&_t2)), const_cast<void*>(reinterpret_cast<const void*>(&_t3)) };
    QMetaObject::activate(this, &staticMetaObject, 0, _a);
}
QT_WARNING_POP
QT_END_MOC_NAMESPACE
