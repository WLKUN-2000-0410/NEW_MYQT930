cd /d "%~dp0"
taskkill /F /IM zolix_service.exe
del /a /f /s /q "*.dmp"
echo %USERNAME% > 1.txt
mkdir C:\ZLData
sc stop zolix_service930
sc delete zolix_service930
zolix_service.exe /Service
sc start zolix_service930
start  http://127.0.0.1:8082/