@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo Awesome Periodic Table -- Windows build
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js was not found on PATH.
  echo Install the LTS release from https://nodejs.org/ and try again.
  exit /b 1
)

set PYOK=0
where python >nul 2>nul
if not errorlevel 1 set PYOK=1
if !PYOK! == 0 (
  where py >nul 2>nul
  if not errorlevel 1 set PYOK=1
)
if !PYOK! == 0 (
  echo ERROR: Python 3 was not found on PATH ^(tried "python" and "py"^).
  echo Install it from https://www.python.org/downloads/windows/ and make sure
  echo "Add python.exe to PATH" is checked in the installer, then try again.
  exit /b 1
)

echo Node.js and Python found. Building both dist targets...
echo.

set BUILD_MODE=%1
if "%BUILD_MODE%"=="" set BUILD_MODE=build
if "%BUILD_MODE%"=="all" set BUILD_MODE=build:all
if "%BUILD_MODE%"=="release" set BUILD_MODE=release

call npm run %BUILD_MODE%
if errorlevel 1 (
  echo.
  echo Build failed -- see the errors above.
  exit /b 1
)

echo.
echo Done. Output:
echo   dist\plain\awesome-periodic-table.html
echo   dist\arcager\awesome-periodic-table.html
echo.
echo Run "build.bat all" to also build the Brotli experiment, or
echo "build.bat release" to build, verify, and package a full release.
endlocal
