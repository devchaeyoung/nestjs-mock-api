# NestJS MongoDB API

> 해당 빠른 목업 api 생성을 위해 claude.ai로 만들어진 프로젝트입니다 ( 총 작업 시간 : 5시간 소요 )

회원관리 및 게시글 관리를 위한 RESTful API 서버입니다. 인증(JWT), 게시글 CRUD/검색, 부서 관리, Swagger 문서를 제공합니다.

## swagger view
<img width="620" alt="image" src="https://github.com/user-attachments/assets/49d59f6a-a973-4454-884a-dd5251fb6f19" />


## 🚀 주요 기능
- 사용자: 회원가입, 로그인, 토큰 갱신, 회원탈퇴 (JWT)
- 게시글: 작성, 상세 조회, 목록/검색(페이징)
- 부서: 기본 부서 데이터 초기화 및 조회
- 공통: 글로벌 예외 필터, 유효성 검사, Rate Limiting, Helmet 보안 헤더, Swagger 문서

## 🛠 기술 스택
- Framework: NestJS 10.x (TypeScript)
- DB: MongoDB (Mongoose ODM)
- Auth: JWT
- Validation: class-validator, class-transformer
- Docs: Swagger (OpenAPI)
- Security: Helmet, Throttler

## 📦 프로젝트 구조
```
src/
├── config/                    # 환경 설정
├── common/                    # 공통 모듈(예외 필터 등)
├── auth/                      # 인증 모듈 (JWT)
├── users/                     # 사용자 모듈
├── posts/                     # 게시글 모듈
├── departments/               # 부서 모듈
├── app.module.ts              # 루트 모듈
└── main.ts                    # 애플리케이션 진입점
```

## ⚙️ 환경 변수 (.env)
필수 항목:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nestjs_api
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
```
- 로컬 MongoDB 사용 시: 기본값(`mongodb://localhost:27017/nestjs_api`)
- Atlas 사용 시: 아래와 같이 `mongodb+srv://` URI로 교체
  - 예) `MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/nestjs_api?retryWrites=true&w=majority&appName=<appName>`
  - 비밀번호 특수문자는 URL 인코딩 필요
  - Atlas에서 DB 사용자 생성, IP 허용 후 사용
- JWT_SECRET 생성은 아래 명령어 터미널에 입력 후 생성된 문자 `.env`에 붙여넣기
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

`.env.local`가 있으면 우선 적용됩니다.

## 🚧 사전 준비
- 로컬 MongoDB 실행 중이거나, Atlas 클러스터가 준비되어야 합니다.
  - Docker (로컬):
    ```bash
    docker run -d --name mongodb -p 27017:27017 mongo:latest
    ```
  - Atlas: 클러스터 생성 → DB User 생성 → IP 허용 → Connection String 복사 → `.env`의 `MONGODB_URI`에 설정

## 🔧 설치 & 실행
```bash
pnpm install
pnpm run start:dev
```
- 빌드: `pnpm run build`
- 프로덕션: `pnpm run start:prod`
- 린트: `pnpm run lint`

## 📚 Swagger 문서
- 서버 실행 후 `http://localhost:${PORT}/api` (기본: `http://localhost:3000/api`)
- Bearer 토큰 입력 후 보호 API 테스트 가능

## 🔐 인증 API
- `POST /auth/register` 회원가입
- `POST /auth/login` 로그인 (access_token 반환)
- `GET /auth/refresh` 토큰 갱신 (JWT 필요)
- `DELETE /auth/withdraw` 회원탈퇴 (JWT 필요)

예시:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"홍길동","departmentId":1}'

TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' | jq -r '.access_token')
```

## 📝 게시글 API
- `GET /posts` 목록(페이징)
- `GET /posts/search` 검색
- `GET /posts/:id` 상세
- `POST /posts` 작성 (JWT 필요)

예시:
```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"제목","content":"내용"}'
```

## 🏢 부서 API
- `GET /departments` 부서 목록 (초기 데이터 자동 upsert)

## 🔒 보안/품질
- Helmet 보안 헤더
- Throttler: 분당 요청 제한(기본 100)
- ValidationPipe: 화이트리스트, 변환, 금지 필드 처리
- 글로벌 예외 필터: 에러 로깅/표준 응답

## 🔄 비밀번호 해시
- `bcryptjs` 사용 (순수 JS, 배포/설치 안정적)
  - 필요 시 네이티브 `bcrypt`로 전환 가능 (pnpm의 빌드 스크립트 허용이 필요)

## ❗️트러블슈팅
- DB 연결 오류 (ECONNREFUSED 127.0.0.1:27017): 로컬 MongoDB가 실행 중인지 확인하거나 Atlas URI로 전환
- Atlas 연결 실패: IP 허용, DB 사용자 권한, 비밀번호 URL 인코딩, 올바른 DB명 쿼리 파라미터 점검

## 📄 라이선스
MIT


