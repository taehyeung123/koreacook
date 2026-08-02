/**
 * 코리아요리아트아카데미 대전점 — 상담폼 수신 스크립트 (Google Apps Script)
 *
 * 설치 방법 (README '사장님이 직접 해야 할 일' 1번 참고):
 *   1. https://sheets.new 에서 새 스프레드시트 생성 (이름: 코요아 대전점 상담DB)
 *   2. 메뉴 [확장 프로그램] → [Apps Script]
 *   3. 기본 코드를 지우고 이 파일 전체를 붙여넣기 → 저장
 *   4. [배포] → [새 배포] → 유형 '웹 앱'
 *      - 실행 계정: 나
 *      - 액세스 권한: 모든 사용자
 *   5. 권한 승인 (경고 화면이 나오면 [고급] → [프로젝트로 이동] → [허용])
 *   6. 발급된 웹 앱 URL(https://script.google.com/macros/s/…/exec)을
 *      js/main.js 맨 위 CONFIG.FORM_ENDPOINT 에 붙여넣기
 */

var SHEET_NAME = '상담신청';
var NOTIFY_EMAIL = 'rnjsxogud2165@gmail.com'; // 접수 알림을 받을 이메일 (변경 가능)

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // 동시 제출 시 행 꼬임 방지
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) {
      sh = ss.insertSheet(SHEET_NAME);
      sh.appendRow(['접수일시', '이름', '연락처', '거주지역', '관심분야', '관심클래스', '상담희망시간대', '접수경로']);
      sh.setFrozenRows(1);
    }
    sh.appendRow([
      new Date(),
      data['이름'] || '',
      data['연락처'] || '',
      data['거주지역'] || '',
      data['관심분야'] || '',
      data['관심클래스'] || '',
      data['상담희망시간대'] || '',
      data['접수경로'] || ''
    ]);

    // 담당자 이메일 알림 — 실패해도 접수 자체는 유지
    try {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: '[코요아 대전점] 새 상담 신청 — ' + (data['이름'] || '이름없음') + ' (' + (data['거주지역'] || '지역미상') + ')',
        body:
          '새 상담 신청이 접수되었습니다.\n\n' +
          '이름: ' + (data['이름'] || '') + '\n' +
          '연락처: ' + (data['연락처'] || '') + '\n' +
          '거주지역: ' + (data['거주지역'] || '') + '\n' +
          '관심분야: ' + (data['관심분야'] || '') + '\n' +
          '관심클래스: ' + (data['관심클래스'] || '') + '\n' +
          '희망시간대: ' + (data['상담희망시간대'] || '') + '\n\n' +
          '상담DB 시트: ' + ss.getUrl()
      });
    } catch (mailErr) {}

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/** 배포 확인용 — 브라우저에서 웹 앱 URL을 열면 {"ok":true,...}가 보이면 정상 */
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, service: 'koyoa-daejeon-consult' }))
    .setMimeType(ContentService.MimeType.JSON);
}
