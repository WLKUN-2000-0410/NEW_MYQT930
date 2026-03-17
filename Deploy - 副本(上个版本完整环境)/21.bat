cd /d "%~dp0"
taskkill /F /IM zolix_service.exe
echo %USERNAME% > 1.txt
mkdir C:\ZLData
net stop zolix_service930
sc delete zolix_service930
zolix_service.exe /Service
net start zolix_service930
start G2  --allow-file-access-from-files --incognito 127.0.0.1:8082