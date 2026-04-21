# 관리자 페이지 설정 가이드

이 문서는 TBcos 사이트의 관리자 페이지 1차 구현을 실제 운영에 연결하기 위한 간단한 설정 가이드입니다.

## 현재 포함된 페이지

- [admin.html](/Users/jeong/Documents/New%20project/admin.html)
- [admin-inquiries.html](/Users/jeong/Documents/New%20project/admin-inquiries.html)
- [admin-members.html](/Users/jeong/Documents/New%20project/admin-members.html)

## 현재 포함된 관리자 함수

- [admin-inquiries](/Users/jeong/Documents/New%20project/supabase/functions/admin-inquiries/index.ts)
- [admin-members](/Users/jeong/Documents/New%20project/supabase/functions/admin-members/index.ts)

두 함수 모두:
- 로그인 세션 필요
- `user_metadata.role === "admin"` 필요

즉, 일반 회원은 접근할 수 없습니다.

---

## 1. 관리자 계정 지정

Supabase 대시보드에서 운영할 계정의 `user_metadata.role` 값을 `admin`으로 지정해야 합니다.

예시:

```json
{
  "full_name": "관리자 이름",
  "company_name": "TBcos",
  "role": "admin",
  "status": "approved"
}
```

추천:
- 관리자 계정 상태도 `approved`
- 일반 회원은 `role: "buyer"` 유지

---

## 2. 함수 배포

프로젝트 루트에서:

```bash
supabase functions deploy admin-inquiries
supabase functions deploy admin-members
```

문의/회원 기능을 모두 최신 상태로 맞추려면:

```bash
supabase functions deploy submit-inquiry
supabase functions deploy admin-inquiries
supabase functions deploy admin-members
```

---

## 3. 실제 테스트 순서

1. 관리자 역할이 지정된 계정으로 로그인
2. 홈 화면에서 `Admin` 버튼 확인
3. [admin.html](https://www.tb-cos.kr/admin.html) 접속
4. 문의 페이지에서 목록이 보이는지 확인
5. 문의 상태/메모 저장 테스트
6. 회원 페이지에서 회원 목록이 보이는지 확인
7. 회원 상태/역할 저장 테스트

---

## 4. 현재 가능한 기능

### 문의 관리
- 최근 문의 목록 보기
- 상태 변경
- 내부 메모 저장

### 회원 관리
- 회원 목록 보기
- 이름 / 회사명 수정
- 상태 변경
- 역할 변경

---

## 5. 현재 제한 사항

- 관리자 계정 지정은 아직 Supabase 대시보드에서 직접 해야 함
- 문의 회신 기능은 없음
- 회신 기록 기능도 아직 없음
- 고급 필터 / 페이지네이션은 아직 없음

즉, 현재는 **운영에 필요한 최소 관리자 기능 1차 버전**입니다.

---

## 6. 나중에 확장할 수 있는 항목

- 문의 목록 고급 필터
- 회신 기록
- 담당자 배정
- 회원/문의 연결
- 관리자 대시보드 통계 카드
- 권한 레벨 세분화
