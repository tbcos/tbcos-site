# Supabase 문의 기능 설정 가이드

이 문서는 현재 공개 문의 폼을 `Supabase Edge Function + DB 저장 + 관리자 알림 메일` 방식으로 운영하기 위한 설정 가이드입니다.

## 현재 구조

- 공개 문의 폼
- 브라우저에서 Supabase `submit-inquiry` Edge Function 호출
- Edge Function이 `public.inquiries` 테이블에 저장
- 저장 후 관리자 알림 메일 발송 시도

즉, 구조는 아래와 같습니다.

```text
문의 폼 → Edge Function → inquiries 저장 + 관리자 알림 메일
```

---

## 1. SQL 실행

아래 파일 중 하나를 Supabase SQL Editor에서 실행합니다.

- [001_create_inquiries.sql](/Users/jeong/Documents/New%20project/supabase/sql/001_create_inquiries.sql)

또는 마이그레이션 기준으로는:

- [20260421100000_create_inquiries.sql](/Users/jeong/Documents/New%20project/supabase/migrations/20260421100000_create_inquiries.sql)

이 SQL은 아래를 수행합니다.

- `public.inquiries` 테이블 생성
- `RLS` 활성화
- 공개 사용자의 직접 `insert` 허용 정책
- 공개 사용자의 `select / update / delete` 차단

현재 문의 저장은 Edge Function이 `service_role`로 수행하므로, RLS는 문의 테이블 직접 접근을 막는 안전장치 역할을 합니다.

---

## 2. inquiries 테이블 주요 컬럼

- `id`
- `created_at`
- `company_name`
- `contact_person`
- `email`
- `phone`
- `inquiry_type`
- `message`
- `privacy_consent`
- `source_page`
- `user_agent`
- `status`
- `admin_note`

---

## 3. 프론트엔드 연결 상태

현재 [index.html](/Users/jeong/Documents/New%20project/index.html)은
문의 제출 시 아래 함수를 호출합니다.

```text
POST https://uzrftgskzojsdyqsomac.supabase.co/functions/v1/submit-inquiry
```

요청 헤더:

- `apikey: <Supabase publishable key>`
- `Authorization: Bearer <Supabase publishable key>`

즉, 브라우저는 DB에 직접 저장하지 않고, Edge Function을 통해 저장과 알림을 같이 처리합니다.

---

## 4. Edge Function 역할

`submit-inquiry` 함수는 아래를 수행합니다.

1. 입력값 검증
2. `public.inquiries`에 문의 저장
3. 관리자 알림 메일 발송 시도
4. 성공 응답 반환

메일 발송이 실패해도 문의 저장은 유지됩니다.  
즉, 운영 중 일시적인 메일 문제로 문의 자체가 유실되지 않도록 설계되어 있습니다.

---

## 5. 관리자 알림 메일용 비밀값

Edge Function에서 메일을 보내려면 아래 Supabase secrets를 설정해야 합니다.

```text
ALERT_SMTP_HOST
ALERT_SMTP_PORT
ALERT_SMTP_USERNAME
ALERT_SMTP_PASSWORD
ALERT_TO_EMAIL
ALERT_FROM_EMAIL
ALERT_FROM_NAME
```

예시:

```text
ALERT_SMTP_HOST=smtp.mail.me.com
ALERT_SMTP_PORT=587
ALERT_SMTP_USERNAME=your-primary-icloud-address@icloud.com
ALERT_SMTP_PASSWORD=Apple 앱 전용 비밀번호
ALERT_TO_EMAIL=inquiry@tb-cos.kr
ALERT_FROM_EMAIL=your-primary-icloud-address@icloud.com
ALERT_FROM_NAME=TBcos
```

참고:
- `ALERT_TO_EMAIL`은 알림을 받을 관리자 메일
- `ALERT_FROM_EMAIL`은 실제 발신에 사용할 SMTP 계정 주소
- iCloud 기반이면 `custom domain 주소`보다 `기본 iCloud 주소`를 발신 SMTP 계정으로 쓰는 편이 안전합니다

---

## 6. secrets 설정 예시

프로젝트 루트에서:

```bash
supabase secrets set \
  ALERT_SMTP_HOST=smtp.mail.me.com \
  ALERT_SMTP_PORT=587 \
  ALERT_SMTP_USERNAME=your-primary-icloud-address@icloud.com \
  ALERT_SMTP_PASSWORD='app-specific-password' \
  ALERT_TO_EMAIL=inquiry@tb-cos.kr \
  ALERT_FROM_EMAIL=your-primary-icloud-address@icloud.com \
  ALERT_FROM_NAME=TBcos
```

---

## 7. 함수 배포

프로젝트 루트에서:

```bash
supabase functions deploy submit-inquiry
```

DB 스키마 반영까지 같이 하려면:

```bash
supabase db push
supabase functions deploy submit-inquiry
```

---

## 8. 완료 기준

아래가 모두 완료되면 현재 문의 기능 운영이 가능합니다.

1. `inquiries` 테이블 생성 완료
2. `submit-inquiry` 함수 배포 완료
3. 관리자 알림 메일 secrets 설정 완료
4. 사이트 문의 폼 제출 성공
5. Supabase 테이블 저장 확인
6. 관리자 메일 수신 확인

---

## 9. CLI 기준 실행 순서

프로젝트 루트에서:

```bash
supabase login
supabase link --project-ref uzrftgskzojsdyqsomac
supabase db push
supabase functions deploy submit-inquiry
```

그다음 secrets 설정 후 실사이트 테스트를 진행합니다.

---

## 10. 나중에 추가하면 좋은 것

현재는 저장 + 관리자 알림 메일 구조입니다.
운영이 안정되면 아래를 확장할 수 있습니다.

1. 관리자 문의 목록 페이지
2. 문의 상태 관리
   - `new`
   - `in_progress`
   - `replied`
   - `closed`
3. 관리자 메모
4. 회원 정보와 문의 이력 연결
5. reCAPTCHA / rate limit
6. 관리자용 문의 대시보드

---

## 11. 운영 메모

- 문의 저장은 우선 보장되고, 메일 알림은 추가 계층으로 동작합니다.
- 메일 발송이 실패해도 문의는 DB에 남으므로, 운영자가 테이블을 기준으로 누락 여부를 점검할 수 있습니다.
- 장기적으로는 문의 목록/상태 관리 UI를 붙이는 것이 가장 자연스러운 다음 단계입니다.
