# 기능 명세서 템플릿

이 문서는 **프론트엔드 작업자와 백엔드/API/DB 작업자 사이의 연동 기준**을 정리할 때 사용하는 템플릿이다.

이 문서의 목적은 다음과 같다.

- 화면이 어떤 목적을 가지는지 명확히 한다.
- 어떤 비즈니스 규칙이 적용되는지 정리한다.
- 화면에 필요한 데이터와 사용자 액션을 정리한다.
- 백엔드가 어떤 API를 만들어야 하는지 전달한다.
- DB 작업자가 어떤 엔티티와 관계를 고려해야 하는지 파악할 수 있게 한다.

즉, 이 문서는 단순한 `API 명세서`가 아니라, **화면 요구사항 + 동작 규칙 + API 요구사항**을 함께 담는 문서다.

---

## 언제 이 문서를 쓰는가

다음과 같은 시점에 작성하면 좋다.

- 프론트 화면 디자인이 어느 정도 나온 뒤
- 백엔드와 API 구조를 연결해야 할 때
- DB 설계 전에 화면 기준 데이터 요구를 정리해야 할 때
- 팀원이 서로 같은 기능을 다르게 이해하고 있을 가능성이 있을 때

---

## 문서에 들어가야 하는 핵심 항목

### 1. 기능 개요

이 기능이 무엇인지, 누가 사용하는지, 왜 필요한지 적는다.

예:

- 기능명
- 목적
- 대상 사용자
- 관련 페이지

### 2. 핵심 비즈니스 규칙

이 기능이 어떤 기준으로 동작하는지 적는다.

예:

- 한 번의 동시 업로드 = 하나의 gallery group
- 결과는 최신순 정렬
- 대표 썸네일은 첫 업로드 이미지 기준

### 3. 화면에 필요한 데이터

프론트가 카드, 리스트, 상세 화면을 그리기 위해 어떤 필드가 필요한지 적는다.

예:

- `id`
- `title`
- `thumbnail_url`
- `image_count`
- `created_at`

### 4. 사용자 액션

사용자가 화면에서 무엇을 할 수 있는지 적는다.

예:

- 목록 조회
- 상세 보기
- 제목 수정
- 삭제
- 일정 생성
- 저널 생성

### 5. 필요한 API

가장 중요한 항목 중 하나다.

각 API에 대해 다음을 정리한다.

- `Method`
- `Endpoint`
- `Purpose`
- `Auth`
- `Request`
- `Response`

### 6. 요청/응답 예시

프론트와 백엔드가 JSON 구조를 서로 다르게 이해하지 않도록 예시를 적는다.

### 7. 빈 상태 / 예외 처리

데이터가 없거나 요청이 실패했을 때 어떻게 보여줄지 적는다.

예:

- 목록이 비어 있으면 빈 상태 문구 표시
- 이미지 선택이 0개면 생성 버튼 비활성화
- 업로드 실패 시 에러 메시지 표시

### 8. DB/API 작업자를 위한 메모

프론트가 DB 자체를 설계하지는 않더라도, 백엔드/DB 작업자가 알아야 할 규칙은 적어준다.

예:

- group 생성 기준은 도시가 아니라 업로드 세션 기준
- 내부 이미지는 업로드 순서를 유지해야 함
- journal과 travel plan은 같은 gallery group을 재사용할 수 있어야 함

---

## 권장 작성 형식

아래 템플릿을 복사해서 기능별로 작성하면 된다.

```md
# [기능명] 기능 명세서

## 1. 기능 개요
- 기능명:
- 목적:
- 대상 사용자:
- 관련 페이지:

## 2. 핵심 비즈니스 규칙
- 
- 
- 

## 3. 화면에 필요한 데이터
| 화면 요소 | 필요한 데이터 | 비고 |
|---|---|---|
|  |  |  |
|  |  |  |

## 4. 사용자 액션
| 액션 | 설명 | 결과 |
|---|---|---|
|  |  |  |
|  |  |  |

## 5. 필요한 API
| Method | Endpoint | 목적 | Auth | 요청 | 응답 |
|---|---|---|---|---|---|
|  |  |  |  |  |  |
|  |  |  |  |  |  |

## 6. 요청/응답 예시

### 요청 예시
```json
{
}
```

### 응답 예시
```json
{
}
```

## 7. 빈 상태 / 예외 처리
- 
- 
- 

## 8. DB/API 작업자 메모
- 
- 
- 
```

---

## 예시: Gallery 기능 명세서

아래는 이 프로젝트에 맞춘 예시다.

### 1. 기능 개요

- 기능명: Gallery
- 목적: 사용자가 업로드한 이미지 그룹을 카드 형태로 조회하고, 그룹 내부 이미지를 확인한다.
- 대상 사용자: 로그인한 일반 사용자
- 관련 페이지: `GalleryPage`, `ImagesPage`

### 2. 핵심 비즈니스 규칙

- 한 번의 동시 업로드 = 하나의 gallery group
- gallery group은 journal 생성 또는 travel plan 생성 과정에서 만들어질 수 있음
- gallery 카드는 대표 썸네일, 그룹 제목, 이미지 개수, 생성일을 보여야 함
- 대표 썸네일은 첫 업로드 이미지 기준
- gallery 목록은 최신 생성순으로 정렬
- gallery group 내부 이미지의 기본 배치 순서는 `uploaded_images`에 기록된 업로드 순서를 따른다.
- 이미지 분석은 제한된 병렬 처리로 수행될 수 있으나, gallery 표시 순서는 분석 완료 시각이 아니라 업로드 기록 순서를 기준으로 유지한다.

### 3. 화면에 필요한 데이터

| 화면 요소 | 필요한 데이터 | 비고 |
|---|---|---|
| 그룹 ID | `gallery_group_id` | 클릭, 수정, 삭제용 |
| 그룹 제목 | `title` | 기본 제목 가능 |
| 대표 썸네일 | `thumbnail_url` | 첫 이미지 기준 |
| 이미지 개수 | `image_count` | 정수 |
| 생성일 | `created_at` | 최신순 정렬용 |
| 저널 존재 여부 | `has_journal` | 선택 |
| 일정 존재 여부 | `has_travel_plan` | 선택 |

### 4. 사용자 액션

| 액션 | 설명 | 결과 |
|---|---|---|
| 갤러리 목록 조회 | 내 group 목록 확인 | 카드 리스트 표시 |
| group 클릭 | 특정 group 상세 보기 | 이미지 목록 페이지 이동 |
| View Images | 내부 이미지 조회 | 이미지 API 호출 |
| 제목 수정 | group 제목 변경 | PATCH API 호출 |
| group 삭제 | group 삭제 | DELETE API 호출 |
| Generate Journal | 저널 생성 화면 이동 | group 데이터 전달 |
| Generate Plan | 일정 생성 화면 이동 | group 데이터 전달 |

### 5. 필요한 API

| Method | Endpoint | 목적 | Auth | 요청 | 응답 |
|---|---|---|---|---|---|
| `GET` | `/api/gallery/groups` | 내 group 목록 조회 | 필요 | 없음 | group 목록 |
| `GET` | `/api/gallery/groups/{groupId}` | 특정 group 상세 조회 | 필요 | path param | group 상세 |
| `GET` | `/api/gallery/groups/{groupId}/images` | group 내부 이미지 조회 | 필요 | path param | image 목록 |
| `PATCH` | `/api/gallery/groups/{groupId}` | group 제목 수정 | 필요 | `title` | 수정된 group |
| `DELETE` | `/api/gallery/groups/{groupId}` | group 삭제 | 필요 | path param | 성공 여부 |
| `POST` | `/api/uploads/session` | 동시 업로드 후 group 생성 | 필요 | multipart files | 생성된 group |
| `POST` | `/api/travel-plans/generate` | 선택 이미지 기반 일정 생성 | 필요 | `group_id`, `selected_image_ids`, `days` | 일정 결과 |
| `POST` | `/api/journals/generate` | 선택 이미지 기반 저널 생성 | 필요 | `group_id`, `selected_image_ids`, `style` | 저널 결과 |

### 6. 요청/응답 예시

#### 업로드 후 group 생성 응답 예시

```json
{
  "gallery_group_id": 12,
  "title": "Kyoto Spring Upload",
  "thumbnail_url": "/uploads/thumbs/12.jpg",
  "image_count": 8,
  "created_at": "2026-04-09T18:20:00Z"
}
```

#### group 목록 응답 예시

```json
[
  {
    "gallery_group_id": 12,
    "title": "Kyoto Spring Upload",
    "thumbnail_url": "/uploads/thumbs/12.jpg",
    "image_count": 8,
    "created_at": "2026-04-09T18:20:00Z",
    "has_journal": false,
    "has_travel_plan": true
  }
]
```

### 7. 빈 상태 / 예외 처리

- gallery group이 하나도 없으면 빈 상태 문구 표시
- 업로드 파일이 0개면 group 생성 불가
- group 내부 이미지가 없으면 빈 상태 표시
- 제목 수정 시 빈 문자열은 허용하지 않음
- 일정/저널 생성 시 선택 이미지가 0개면 에러 메시지 표시

### 8. DB/API 작업자 메모

- group 생성 기준은 도시가 아니라 동시 업로드 세션 기준
- 내부 이미지는 업로드 순서를 유지해야 함
- 대표 썸네일은 첫 업로드 이미지 기준
- journal과 travel plan은 같은 gallery group을 재사용할 수 있어야 함

### 9. 향후 확장 예정 기능

- 현재 범위에서는 이미지가 자동으로 gallery group에 배치되며, 사용자가 그룹 간 이미지를 수동으로 이동하는 기능은 포함하지 않는다.
- 향후 확장에서는 사용자가 특정 이미지를 다른 gallery group으로 이동하거나, gallery 밖의 별도 보관 공간으로 분리할 수 있는 기능을 추가할 수 있다.
- 향후 확장에서는 `library`와 같은 별도 이미지 관리 기능을 두어, 사용자가 gallery 자동 그룹과 별개로 자신만의 이미지 묶음을 수동으로 구성할 수 있다.
- 위 기능은 현재 Gallery 기본 규칙과는 분리된 후속 기능으로 간주하며, 현재 설계에서는 자동 group 생성과 기본 순서 유지만 우선 지원한다.

---

## 이 문서를 사용할 때 주의할 점

- 프론트 작업자가 DB 컬럼을 모두 확정할 필요는 없다.
- 대신 화면에서 필요한 데이터와 동작 규칙은 명확히 전달해야 한다.
- 백엔드/API/DB 작업자는 이 문서를 바탕으로 엔드포인트와 테이블 구조를 정리한다.
- API 명세는 이 문서의 일부이며, 전체 기능 흐름과 규칙까지 함께 들어가야 협업이 쉬워진다.
