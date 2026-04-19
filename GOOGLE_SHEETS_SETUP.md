# Google Sheets Inquiry Setup

현재 사이트의 문의 폼은 Google Apps Script 웹앱 URL로 데이터를 전송하도록 준비되어 있습니다.
전송 방식은 `application/json` 기반의 JSON payload 입니다.

## 1. Google Sheet 만들기

새 Google Spreadsheet를 만들고 첫 번째 시트 이름을 `Inquiries`로 지정합니다.

첫 번째 행에는 아래 헤더를 넣습니다.

```text
submitted_at | company_name | contact_person | email | phone | inquiry_type | message | privacy_consent | source_page | user_agent
```

## 2. Apps Script 만들기

Google Sheet에서 `확장 프로그램 > Apps Script`로 이동한 뒤 아래 코드를 붙여넣습니다.

이 버전은 두 가지를 함께 처리합니다.

- Google Sheets에 문의 저장
- `inquiry@tb-cos.kr` 로 새 문의 알림 메일 발송

```javascript
function doPost(e) {
  if (!e || !e.postData) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: "No post data received" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inquiries");

  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: "Sheet not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data = JSON.parse(e.postData.contents || "{}");

  sheet.appendRow([
    data.submitted_at || new Date().toISOString(),
    data.company_name || "",
    data.contact_person || "",
    data.email || "",
    data.phone || "",
    data.inquiry_type || "",
    data.message || "",
    data.privacy_consent || "",
    data.source_page || "",
    data.user_agent || "",
  ]);

  const subject = "[TBcos] New Inquiry Received";
  const body =
    "A new inquiry has been submitted.\n\n" +
    "Company: " + (data.company_name || "") + "\n" +
    "Contact: " + (data.contact_person || "") + "\n" +
    "Email: " + (data.email || "") + "\n" +
    "Phone: " + (data.phone || "") + "\n" +
    "Type: " + (data.inquiry_type || "") + "\n\n" +
    "Message:\n" + (data.message || "");

  MailApp.sendEmail({
    to: "inquiry@tb-cos.kr",
    subject: subject,
    body: body,
    replyTo: data.email || undefined,
  });

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 3. 웹앱 배포

`배포 > 새 배포`를 선택하고 아래처럼 설정합니다.

- 유형: `웹 앱`
- 실행 사용자: `나`
- 액세스 권한: `모든 사용자`

배포 후 나오는 웹앱 URL을 복사합니다.

처음 배포하거나 코드를 수정한 뒤에는 Google이 메일 발송 권한 승인을 요청할 수 있습니다. 승인 과정을 마쳐야 `MailApp.sendEmail()` 이 정상 작동합니다.

## 4. 사이트에 URL 넣기

[index.html](/Users/jeong/Documents/New%20project/index.html) 파일에서 아래 값을 실제 URL로 바꿉니다.

```javascript
const GOOGLE_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL_HERE";
```

예시:

```javascript
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxxxxxxxxxxxx/exec";
```

## 5. 테스트

사이트를 열고 문의 폼을 제출한 뒤 아래 두 가지를 확인합니다.

- Google Sheet에 새 행이 추가되는지
- `inquiry@tb-cos.kr` 로 알림 메일이 도착하는지

중요:

- Apps Script 편집기에서 `Run` 버튼으로 `doPost()`를 직접 실행하면 `e.postData` 가 없어서 오류가 납니다.
- 반드시 실제 웹사이트 폼 제출이나 외부 POST 요청으로 테스트해야 합니다.

## 운영 팁

- 스팸이 늘면 reCAPTCHA나 Cloudflare Turnstile을 추가하는 것이 좋습니다.
- 메일은 Apps Script를 배포한 Google 계정 권한으로 발송됩니다.
- 개인정보가 포함되므로 시트 접근 권한은 내부 담당자만 허용하세요.
- 사이트가 현재 보내는 JSON 키는 `submitted_at`, `company_name`, `contact_person`, `email`, `phone`, `inquiry_type`, `message`, `privacy_consent`, `source_page`, `user_agent` 입니다.
