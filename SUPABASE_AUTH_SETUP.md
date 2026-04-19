# Supabase 인증 설정 가이드

이 프로젝트에는 아래 페이지에 바로 연결할 수 있는 Supabase 로그인 구조가 포함되어 있습니다.

- `index.html`
- `auth.html`
- `account.html`
- `auth-callback.html`

## 추가된 파일

- `assets/js/supabase-client.js`
- `assets/js/session-ui.js`
- `assets/js/auth-ui.js`
- `assets/js/account-page.js`
- `assets/js/auth-callback.js`

## 지금 바로 해야 할 2가지

Supabase 로그인이 실제로 동작하려면 먼저 아래 두 가지를 해야 합니다.

### 1. Supabase 키를 파일에 넣기

먼저 [assets/js/supabase-client.js](/Users/jeong/Documents/New%20project/assets/js/supabase-client.js) 파일을 엽니다.

파일 안에는 현재 아래처럼 placeholder 값이 들어 있습니다.

```javascript
export const SUPABASE_URL = "PASTE_YOUR_SUPABASE_URL_HERE";
export const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";
```

여기서 해야 할 일은 `PASTE...` 부분을 실제 Supabase 프로젝트 값으로 바꾸는 것입니다.

값을 찾는 방법:

1. [Supabase](https://supabase.com) 에 로그인합니다.
2. 새 프로젝트를 만들거나 기존 프로젝트를 선택합니다.
3. 왼쪽 메뉴에서 `Project Settings` 로 들어갑니다.
4. 그 안에서 `API` 메뉴를 엽니다.
5. 아래 두 값을 찾습니다.
   - `Project URL`
   - `anon public key`

예시:

```javascript
export const SUPABASE_URL = "https://abcdefghijk.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

주의할 점:

- `SUPABASE_URL`은 보통 `https://...supabase.co` 형태입니다.
- `SUPABASE_ANON_KEY`는 매우 긴 문자열입니다.
- `service_role key`가 아니라 반드시 `anon public key`를 넣어야 합니다.

이 단계가 필요한 이유:

현재 사이트는 로그인 기능 구조만 준비된 상태입니다. 실제로 어느 Supabase 프로젝트에 연결할지 아직 모르는 상태이기 때문에, 이 두 값을 넣어야 회원가입과 로그인 기능이 작동합니다.

### 2. `file://` 대신 로컬 서버로 실행하기

브라우저에서 파일을 그냥 더블클릭해서 열면 주소가 `file:///.../index.html` 처럼 보입니다.

이 방식은 정적인 화면 확인에는 괜찮지만, Supabase 로그인처럼 인증이 필요한 기능에는 적합하지 않습니다. 특히 아래 기능은 `file://` 환경에서 제대로 동작하지 않을 수 있습니다.

- 이메일 인증 링크 이동
- Kakao 로그인
- `auth-callback.html` 세션 처리

그래서 아래처럼 로컬 서버를 실행해서 테스트해야 합니다.

```bash
cd "/Users/jeong/Documents/New project"
python3 -m http.server 8000
```

명령어 설명:

- 첫 번째 줄: 프로젝트 폴더로 이동
- 두 번째 줄: 테스트용 간단한 웹서버 실행

서버가 켜지면 브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:8000/index.html
```

이 단계가 필요한 이유:

Supabase 인증은 로그인 후 다시 돌아올 주소를 기준으로 동작합니다. 그래서 `http://localhost:8000/...` 같은 웹 주소로 실행해야 callback 흐름이 안정적으로 처리됩니다.

### 다 했는지 확인하는 방법

아래 항목이 되면 기본 준비는 끝난 것입니다.

1. `assets/js/supabase-client.js`에 실제 `SUPABASE_URL`과 `SUPABASE_ANON_KEY`를 넣었다.
2. 터미널에서 `python3 -m http.server 8000` 을 실행했다.
3. 브라우저에서 [http://localhost:8000/index.html](http://localhost:8000/index.html) 로 접속했다.
4. 상단의 `Sign In` 버튼을 눌렀을 때 `auth.html`이 열렸다.

## 1. Supabase 키 입력하기

`assets/js/supabase-client.js` 파일을 열어서 아래 두 개의 placeholder 값을 실제 값으로 바꿔주세요.

```javascript
export const SUPABASE_URL = "PASTE_YOUR_SUPABASE_URL_HERE";
export const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";
```

## 2. 인증 제공자 활성화

Supabase 대시보드에서 아래 항목을 활성화합니다.

- Email 로그인
- Kakao 로그인

Kakao 로그인의 경우 Supabase 공식 설정 가이드를 따라 앱을 연결한 뒤, Supabase 대시보드에 표시되는 callback URL을 Kakao 개발자 설정에 등록해야 합니다.

## 3. Redirect URL 등록

Supabase Auth 설정에서 아래 Redirect URL을 등록합니다.

- `http://localhost:8000/auth-callback.html`
- 실제 배포 주소
예시:
- `https://your-domain.com/auth-callback.html`

## 4. 로컬 테스트 방법

OAuth 로그인과 이메일 인증 callback 흐름은 `http://localhost` 또는 실제 배포 주소에서 테스트해야 합니다.
`file://` 경로에서는 정상적으로 동작하지 않을 수 있습니다.

로컬 서버 실행:

```bash
cd "/Users/jeong/Documents/New project"
python3 -m http.server 8000
```

브라우저 접속:

```text
http://localhost:8000/index.html
```

## 5. 다음 단계로 추천하는 DB 구조

인증된 사용자마다 역할과 승인 상태 같은 파트너 정보를 저장하려면 `profiles` 테이블을 추가하는 것을 권장합니다.

예시 컬럼:

- `id uuid primary key`
- `email text`
- `full_name text`
- `company_name text`
- `role text`
- `status text`
- `created_at timestamptz default now()`

추천 값:

- `role`: `buyer`, `admin`
- `status`: `pending`, `approved`, `rejected`

## 참고 사항

- `auth.html`은 로그인, 회원가입, Kakao 로그인을 처리합니다.
- `account.html`은 로그인 후 진입하는 기본 계정 페이지입니다.
- `index.html`은 네비게이션에 인증 버튼을 표시하고 세션 상태에 따라 내용을 바꿉니다.
- 현재 `account.html`은 Supabase Auth의 `user_metadata`를 읽습니다. 아직 별도의 `profiles` 테이블 데이터를 가져오도록 연결되어 있지는 않습니다.
