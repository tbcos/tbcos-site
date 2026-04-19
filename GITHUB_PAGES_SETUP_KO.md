# GitHub Pages 배포 가이드

이 프로젝트는 정적 사이트라서 `GitHub Pages`로 바로 배포할 수 있습니다.

현재 이 폴더에는 이미 커스텀 도메인용 파일이 들어 있습니다.

- `CNAME`
  - 내용: `www.tb-cos.kr`

이 파일은 GitHub Pages에서 커스텀 도메인을 사용할 때 필요합니다.

## 1. GitHub 저장소 만들기

GitHub에서 새 저장소를 만드세요.

추천 저장소 이름 예시:

- `tbcos-site`
- `three-body-site`
- `tb-co-website`

저장소를 만든 뒤, 터미널에서 아래처럼 원격 저장소를 연결합니다.

```bash
cd "/Users/jeong/Documents/New project"
git remote add origin https://github.com/계정이름/저장소이름.git
```

이미 연결했다면 아래로 확인할 수 있습니다.

```bash
git remote -v
```

## 2. GitHub에 코드 올리기

현재 수정사항을 커밋한 뒤 GitHub로 올립니다.

```bash
cd "/Users/jeong/Documents/New project"
git add .
git commit -m "Prepare site for GitHub Pages deployment"
git push -u origin main
```

## 3. GitHub Pages 켜기

GitHub 저장소 페이지에서:

1. `Settings`
2. 왼쪽 메뉴 `Pages`
3. `Build and deployment`
4. `Source`를 `Deploy from a branch`로 선택
5. `Branch`를 `main` / `/root`로 선택
6. `Save`

잠시 기다리면 GitHub Pages 기본 주소가 생성됩니다.

예:

- `https://계정이름.github.io/저장소이름/`

## 4. 커스텀 도메인 연결

같은 `Pages` 화면에서:

1. `Custom domain`에 `www.tb-cos.kr` 입력
2. `Save`

정상적으로 저장되면 GitHub가 `CNAME` 파일을 기준으로 도메인을 기억합니다.

## 5. GoDaddy DNS 변경

GoDaddy에서 `www.tb-cos.kr`를 현재 Canva 대신 GitHub Pages로 보내야 합니다.

GoDaddy DNS에서:

1. `www` 레코드 찾기
2. 기존 Canva 연결값 제거 또는 수정
3. `CNAME`으로 변경
4. 값은 GitHub Pages 기본 주소에 맞게 설정

일반적으로는 아래 형식입니다.

- 호스트: `www`
- 타입: `CNAME`
- 값: `계정이름.github.io`

중요:

- 저장소 이름은 DNS 값에 넣지 않습니다.
- DNS 값은 보통 `계정이름.github.io` 형태입니다.

## 6. HTTPS 확인

GitHub 저장소 `Settings > Pages`에서:

- `Enforce HTTPS` 체크 가능 여부 확인

DNS가 제대로 연결되고 나면 체크할 수 있습니다.

적용까지는 보통 조금 시간이 걸릴 수 있습니다.

## 7. 앞으로 수정하는 방법

사이트를 수정한 뒤에는 아래만 반복하면 됩니다.

```bash
cd "/Users/jeong/Documents/New project"
git add .
git commit -m "Update site content"
git push
```

그러면 GitHub Pages가 자동으로 새 버전을 반영합니다.

## 주의할 점

- 현재 `www.tb-cos.kr`가 Canva에 연결되어 있으면, GoDaddy DNS에서 `www` 값을 바꾸는 순간 새 사이트로 전환됩니다.
- 그래서 먼저 GitHub Pages 기본 주소에서 사이트를 확인한 뒤 DNS를 바꾸는 것이 안전합니다.
- 루트 도메인 `tb-cos.kr`는 나중에 연결해도 됩니다.

## 추천 순서

1. GitHub 저장소 생성
2. 코드 push
3. GitHub Pages 활성화
4. GitHub Pages 기본 주소로 테스트
5. GoDaddy에서 `www.tb-cos.kr` DNS를 GitHub Pages로 변경
6. HTTPS 확인
