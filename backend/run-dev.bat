@echo off
echo Ejecutando servidor de desarrollo...
echo.
echo Configuracion de la base de datos:
echo Host: localhost
echo Database: condominios_db
echo User: root
echo.
echo Iniciando servidor...
echo.

node_modules\.bin\tsx watch src/index.ts