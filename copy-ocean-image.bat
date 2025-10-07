@echo off
echo Copying ocean.jpg to public/assets folder...
copy "frontend\src\assets\ocean.jpg" "frontend\public\assets\ocean.jpg"
if %errorlevel% == 0 (
    echo.
    echo SUCCESS! Ocean image copied successfully.
    echo.
) else (
    echo.
    echo ERROR! Failed to copy image.
    echo Please copy manually from:
    echo   frontend\src\assets\ocean.jpg
    echo To:
    echo   frontend\public\assets\ocean.jpg
    echo.
)
pause
