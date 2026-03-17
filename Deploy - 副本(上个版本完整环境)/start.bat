cd /d "%~dp0"

sc stop zolix_service930
sc delete zolix_service930
zolix_service.exe /Service
sc start zolix_service930
