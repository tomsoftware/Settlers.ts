echo.
echo.
echo This will create a list of file names in the "public" folder
echo.
echo.

@echo off
SET "StartPath=%~dp0"
SET "outfile=%~dp0\file-list.txt"

del %outfile%

SetLocal EnableDelayedExpansion
FOR /f "tokens=*" %%f in ('dir /B /ON /S "!StartPath!"') DO (
    set "SubDirsAndFiles=%%f"
    set "SubDirsAndFiles=!SubDirsAndFiles:%StartPath%=!"
    ECHO !SubDirsAndFiles!>>%outfile%
)


