# Backend Folder Roles (한국어)

이 문서는 **Travel From Photo** 프로젝트의 권장 백엔드 폴더 구조와 각 폴더의 역할을 설명합니다.

이런 구조 설명 문서는 보통 아래 둘 중 하나에 둡니다.

- `docs/` : 팀 전체가 함께 보는 아키텍처 문서
- `backend/README.md` : 백엔드 개발자 전용 문서

이 프로젝트는 프론트엔드, API, DB 설계가 서로 연결되어 있으므로 `docs/`에 두는 것이 더 자연스럽습니다.

---

## 권장 백엔드 구조

```text
backend/
  app/
    routers/
      image.py
    services/
      exif_service.py
      clip_service.py
      image_ingestion_service.py
    repositories/
      image_metadata_repository.py
    models/
      image_metadata.py
    schemas/
      image_metadata.py
    core/
      config.py
      db.py
```

---

## 폴더별 역할

### `routers/`

**역할:** API 진입 계층

이 폴더는 프론트엔드나 다른 클라이언트가 보내는 HTTP 요청을 받습니다.

주요 책임:

- `POST /api/image/upload` 같은 API 엔드포인트 정의
- 요청 파라미터, 업로드 파일, query 값 읽기
- service 계층 호출
- JSON 응답 반환

이 폴더에 많이 넣지 말아야 하는 것:

- 무거운 EXIF 파싱 로직
- CLIP / OpenAI 분석 로직
- 직접적인 SQLAlchemy insert / update 코드

정리하면:

`routers`는 얇게 유지하는 것이 좋습니다. 프론트엔드와 백엔드가 만나는 진입점입니다.

---

### `services/`

**역할:** 비즈니스 로직 및 계산 계층

이 폴더에는 실제 애플리케이션 로직이 들어갑니다.

주요 책임:

- 업로드 이미지에서 EXIF 메타데이터 추출
- CLIP 분류 실행
- 나중에 OpenAI, 날씨 API, Google API 호출
- 여러 단계를 묶어서 하나의 흐름으로 처리

이 프로젝트 예시:

- `exif_service.py`
  - 이미지 메타데이터 추출
- `clip_service.py`
  - CLIP 기반 이미지 라벨링
- `image_ingestion_service.py`
  - 상위 orchestration 흐름
  - 예:
    - 업로드 파일 받기
    - 메타데이터 추출
    - GPS 존재 여부 판단
    - 필요 시 CLIP 실행
    - repository를 통해 결과 저장

정리하면:

`services`는 시스템이 **무엇을 하는지**를 결정하는 계층입니다.

---

### `repositories/`

**역할:** DB 접근 계층

이 폴더는 DB에 읽고 쓰는 코드를 담당합니다.

주요 책임:

- 메타데이터 row insert
- 분석 상태 update
- 저장된 이미지/후보 조회
- SQLAlchemy session 세부사항을 상위 계층에서 숨김

예시:

- `image_metadata_repository.py`
  - `create_image_metadata(...)`
  - `get_image_metadata_by_id(...)`
  - `list_metadata_with_gps(...)`

왜 필요한가:

- service 코드가 더 깔끔해짐
- DB 코드가 한곳에 모임
- 스키마가 바뀌어도 영향 범위가 줄어듦

정리하면:

`repositories`는 데이터를 **어떻게 저장하고 가져오는지**를 담당합니다.

---

### `models/`

**역할:** DB 스키마 계층

이 폴더에는 SQLAlchemy ORM 모델이 들어갑니다.

주요 책임:

- 테이블 이름 정의
- 컬럼과 타입 정의
- PK / FK 정의
- 테이블 간 관계 정의

예시:

- `image_metadata.py`
  - 메타데이터 저장용 SQLAlchemy 모델

정리하면:

`models`는 **DB 테이블이 어떻게 생겼는지**를 정의합니다.

---

### `schemas/`

**역할:** 요청/응답 데이터 형식 계층

이 폴더는 API를 통해 오가는 데이터 구조를 정의합니다.

주요 책임:

- request body 형태 검증
- response JSON 형태 정의
- API contract를 명확하게 유지

예시:

- 업로드 이미지 처리 요청 schema
- 추출된 메타데이터 응답 schema

왜 중요한가:

- router 코드가 더 읽기 쉬워짐
- API 응답 형식이 일관됨
- 프론트엔드가 어떤 형태의 데이터를 받는지 명확해짐

정리하면:

`schemas`는 API로 **들어오고 나가는 데이터 형식**을 정의합니다.

---

### `core/`

**역할:** 공통 백엔드 기반 계층

이 폴더는 백엔드 전역에서 사용하는 저수준 설정과 기반 코드를 담습니다.

주요 책임:

- 환경변수 로드
- DB engine / session 설정
- 공통 유틸리티 제공

현재 프로젝트 예시:

- `config.py`
  - DB URL, API key 같은 환경변수
- `db.py`
  - SQLAlchemy engine, session, base class

정리하면:

`core`는 모든 백엔드 계층이 사용하는 **기반 토대**입니다.

---

## 권장 요청 흐름

이 프로젝트의 의도된 요청 흐름은 아래와 같습니다.

```text
Frontend
-> router
-> service
-> repository
-> database
```

이미지 분석 흐름 예시:

```text
Frontend upload
-> routers/image.py
-> services/image_ingestion_service.py
-> services/exif_service.py
-> services/clip_service.py
-> repositories/image_metadata_repository.py
-> PostgreSQL
```

---

## 왜 이 구조가 도움이 되는가

이 구조는 복잡도가 커질수록 역할을 분리해서 관리하기 쉽게 만듭니다.

- `routers` 는 요청을 받음
- `services` 는 로직과 흐름을 처리함
- `repositories` 는 저장/조회 담당
- `models` 는 테이블 구조 정의
- `schemas` 는 API 데이터 형식 정의
- `core` 는 공통 기반 제공

즉 한 파일이 모든 일을 한 번에 하지 않게 만듭니다.

---

## 실전에서 판단하는 기준

새 코드를 어디에 둘지 애매할 때는 이렇게 판단하면 됩니다.

- HTTP 요청을 받는 코드면 `routers`
- 비즈니스 로직이나 orchestration이면 `services`
- DB 저장/조회 코드면 `repositories`
- DB 테이블 정의면 `models`
- 요청/응답 데이터 형식이면 `schemas`
- 전역 설정이나 공통 기반이면 `core`

---

## 이 프로젝트에 대한 메모

- 현재 코드베이스에는 이미 `routers`, `services`, `models`, `core`가 존재합니다.
- `repositories` 와 `schemas` 는 DB/API가 커질수록 다음 단계로 추가하기 좋은 계층입니다.
- 이 구조는 앞으로 들어갈 다음 기능들에 특히 유용합니다.
  - Google Geocoding 연동
  - OpenAI itinerary 생성
  - weather API 연동
  - gallery persistence
  - Travelize
  - AI Trip Journal
