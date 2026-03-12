@echo off
echo.
echo ====================================================
echo  카카오 알림톡 발송 시스템 - 로컬 미리보기
echo ====================================================
echo.
echo  브라우저에서 아래 주소로 접속하세요:
echo.
echo    http://localhost:3000/login.html
echo.
echo  로그인: 아무 이메일/비밀번호나 입력
echo  (데모 모드 - 샘플 데이터로 동작)
echo.
echo  종료: 이 창 닫기
echo ====================================================
echo.
cd /d "%~dp0"
start "" "http://localhost:3000/login.html"
py -3 -m http.server 3000
pause
