!macro customInstall
  ; Создание ярлыка на рабочем столе
  CreateShortCut "$DESKTOP\Яндекс Музыка.lnk" "$INSTDIR\yandex-music-client.exe" "" "$INSTDIR\yandex-music-client.exe" 0
  
  ; Создание папки в меню Пуск
  CreateDirectory "$SMPROGRAMS\Яндекс Музыка"
  CreateShortCut "$SMPROGRAMS\Яндекс Музыка\Яндекс Музыка.lnk" "$INSTDIR\yandex-music-client.exe" "" "$INSTDIR\yandex-music-client.exe" 0
  CreateShortCut "$SMPROGRAMS\Яндекс Музыка\Удалить.lnk" "$INSTDIR\uninstall.exe" "" "$INSTDIR\uninstall.exe" 0
  
  ; Регистрация в системе для автозапуска
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "Яндекс Музыка" "$INSTDIR\yandex-music-client.exe"
  
  ; Регистрация типов файлов
  WriteRegStr HKCR ".ymusic" "" "Яндекс Музыка.File"
  WriteRegStr HKCR "Яндекс Музыка.File" "" "Яндекс Музыка Файл"
  WriteRegStr HKCR "Яндекс Музыка.File\DefaultIcon" "" "$INSTDIR\yandex-music-client.exe,0"
  WriteRegStr HKCR "Яндекс Музыка.File\shell\open\command" "" '"$INSTDIR\yandex-music-client.exe" "%1"'
!macroend

!macro customUnInstall
  ; Удаление ярлыков
  Delete "$DESKTOP\Яндекс Музыка.lnk"
  RMDir /r "$SMPROGRAMS\Яндекс Музыка"
  
  ; Удаление из автозапуска
  DeleteRegValue HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "Яндекс Музыка"
  
  ; Удаление регистрации типов файлов
  DeleteRegKey HKCR ".ymusic"
  DeleteRegKey HKCR "Яндекс Музыка.File"
!macroend

; Функция для проверки требований
Function .onInit
  ; Проверка версии Windows
  ${If} ${AtLeastWin10}
    ; Windows 10 или выше - OK
  ${Else}
    MessageBox MB_OK|MB_ICONSTOP "Для работы приложения требуется Windows 10 или выше."
    Abort
  ${EndIf}
  
  ; Проверка архитектуры
  ${If} ${RunningX64}
    ; 64-bit система - OK
  ${Else}
    MessageBox MB_OK|MB_ICONSTOP "Приложение требует 64-битную версию Windows."
    Abort
  ${EndIf}
FunctionEnd

; Функция для завершения установки
Function .onInstSuccess
  MessageBox MB_YESNO "Установка завершена успешно!$\n$\nЗапустить Яндекс Музыка сейчас?" IDYES launchApp IDNO skipLaunch
  launchApp:
    Exec "$INSTDIR\yandex-music-client.exe"
  skipLaunch:
FunctionEnd 