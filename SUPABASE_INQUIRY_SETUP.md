# Supabase 문의 기능 설정 가이드

이 문서는 현재 공개 문의 폼을 `Supabase DB 직접 저장 방식`으로 운영하기 위한 설정 가이드입니다.

## 현재 구조

- 공개 문의 폼
- 브라우저에서 Supabase `public.inquiries` 테이블에 직접 `insert`
- `RLS`로 공개 사용자는 `insert`만 허용
- `select / update / delete`는 차단

즉, 구조는 아래와 같습니다.

```text
문의 폼 → Supabase DB 직접 저장
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
- 공개 사용자의 `insert`만 허용
- 공개 사용자의 `select / update / delete` 차단

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

## 3. 공개 폼 보안 원칙

공개 사용자는:

- 문의 작성 가능
- 문의 읽기 불가
- 문의 수정 불가
- 문의 삭제 불가

즉, 사이트 방문자는 자기 문의를 DB에 저장만 할 수 있고,
조회나 수정은 할 수 없습니다.

---

## 4. 프론트엔드 연결 상태

현재 [index.html](/Users/jeong/Documents/New%20project/index.html)은
문의 제출 시 Supabase JS client를 사용해 아래 테이블로 직접 저장합니다.

```text
public.inquiries
```

사용하는 설정값:

- Supabase Project URL
- Supabase Publishable Key

---

## 5. 실제 저장되는 값

문의 폼에서 저장되는 값:

- 회사명
- 담당자명
- 이메일
- 문의 유형
- 메시지
- 개인정보 동의 여부
- 현재 페이지 주소
- 브라우저 user agent

---

## 6. 완료 기준

아래가 모두 완료되면 Supabase 문의 기능 운영이 가능합니다.

1. `inquiries` 테이블 생성 완료
2. RLS 정책 반영 완료
3. 사이트 문의 폼 제출 성공
4. Supabase 테이블에서 데이터 저장 확인

---

## 7. CLI 기준 실행 순서

프로젝트 루트에서:

```bash
supabase login
supabase link --project-ref uzrftgskzojsdyqsomac
supabase db push
```

이 프로젝트에서는 문의 기능 기준으로 SQL 반영까지만 필수입니다.

---

## 8. 나중에 추가하면 좋은 것

현재는 저장 중심 구조입니다.
운영이 안정되면 아래를 확장할 수 있습니다.

1. 관리자 문의 목록 페이지
2. 문의 상태 관리
   - `new`
   - `in_progress`
   - `replied`
   - `closed`
3. 관리자 메모
4. 회원 정보와 문의 이력 연결
5. 알림 메일
6. reCAPTCHA / rate limit

---

## 9. Edge Function은 선택 사항

이전에는 `Edge Function` 경유 방식을 시도했지만,
공개 문의 폼에서는 인증 헤더 제약 때문에
지금 프로젝트에는 `DB 직접 insert + RLS` 방식이 더 현실적입니다.

즉, 현재 문의 기능에는 Edge Function이 필수가 아닙니다.
