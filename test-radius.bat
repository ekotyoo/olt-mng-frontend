@echo off
echo Testing Radius Authentication...
set /p USER="Enter Username (from subscription): "
set /p PASS="Enter Password (from subscription): "

echo.
echo Running radtest inside Docker container...
docker-compose exec freeradius radtest %USER% %PASS% localhost 0 testing123
pause
