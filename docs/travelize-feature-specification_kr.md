# Travelize 기능 명세서

## 1. 기능 개요

- 기능명: Travelize
- 목적: 사용자가 여행 이미지를 선택하면, EXIF 메타데이터와 저장된 좌표 정보를 바탕으로 1일~5일 여행 일정을 자동 생성하고 편집할 수 있도록 한다.
- 주요 사용자: 로그인한 일반 사용자
- 관련 화면:
  - Travelize 그룹 선택 화면
  - Travelize 이미지 선택 화면
  - Travelize 일정 결과 및 편집 화면

---

## 2. 기능 목표

- 갤러리에 저장된 여행 이미지를 일정 생성에 재사용한다.
- 이미지 메타데이터에서 날짜, 시간, 위치 정보를 추출한다.
- 가까운 장소끼리 우선적으로 묶어 여행 순서를 추천한다.
- 사용자가 선택한 기간(1~5일)에 맞추어 Day 단위 일정으로 분배한다.
- 사용자가 직접 순서를 수정하면, 그 결과를 최종 일정으로 반영한다.

---

## 3. 주요 처리 순서

### 3.1 데이터 추출

- 시스템은 선택된 이미지에서 EXIF 메타데이터를 추출한다.
- 추출 대상 정보는 다음과 같다.
  - 촬영 날짜
  - 촬영 시간
  - 위도
  - 경도

### 3.2 1차 그룹화

- 시스템은 한국 표준시(KST) 00:00 기준으로 날짜를 구분한다.
- 시스템은 동일 날짜 내에서도 도시(City) 단위가 다르면 별도 그룹으로 분리한다.
- 결과적으로 Travelize 후보 세트는 `날짜 + 도시` 기준으로 구성된다.

예시:

- 2026-04-10 서울 4장
- 2026-04-10 도쿄 3장
- 2026-04-11 서울 2장

### 3.3 유저 필터링

- 사용자는 Travelize에서 특정 후보 세트를 선택한다.
- 시스템은 선택된 세트 안의 이미지 목록을 표시한다.
- 사용자는 일정 생성에 사용할 이미지를 체크박스로 선택하거나 제외한다.

### 3.4 클러스터링 및 일정 배분

- 시스템은 선택된 이미지들의 위도/경도 좌표를 분석한다.
- 시스템은 지리적으로 가까운 장소끼리 우선 순위를 두어 방문 순서를 추천한다.
- 시스템은 사용자가 선택한 여행 기간(1~5일)에 맞추어 장소들을 Day 단위로 분배한다.
- 자동 생성 결과는 실시간 내비게이션이 아닌 추천 기반의 추정 일정이다.

### 3.5 수동 보정

- 시스템은 생성된 일정을 표 형태로 표시한다.
- 사용자는 drag-and-drop으로 장소의 순서나 날짜 배치를 직접 수정할 수 있다.
- 사용자가 수동으로 수정한 순서는 자동 생성 순서보다 우선한다.
- 일정이 수정되면 지도 경로도 즉시 다시 계산되어 반영된다.

---

## 4. 비즈니스 규칙

### 4.1 전처리 그룹화 규칙

- 갤러리 그룹의 기본 기준은 `KST 날짜 + 도시`이다.
- 동일 날짜, 동일 도시이면 같은 그룹으로 묶인다.
- 동일 날짜라도 도시가 다르면 다른 그룹으로 분리된다.
- 도시가 같더라도 날짜가 다르면 다른 그룹으로 분리된다.

### 4.2 이미지 선택 규칙

- 사용자는 최소 1장 이상의 이미지를 선택해야 itinerary generation을 요청할 수 있다.
- 선택되지 않은 이미지는 일정 생성 계산에서 제외된다.

### 4.3 기간 선택 규칙

- 사용자는 여행 기간을 1일 이상 5일 이하로 선택할 수 있다.
- 시스템은 선택된 기간을 기준으로 Day 1 ~ Day N 열을 생성한다.

### 4.4 위치 정보 사용 규칙

- 위도/경도 정보가 있는 이미지가 일정 생성의 기본 대상이다.
- EXIF GPS가 없더라도, 이전 Search 단계에서 좌표가 저장된 이미지라면 일정 생성에 사용할 수 있다.
- 좌표가 전혀 없는 이미지는 자동 경로 계산 대상에서 제외되거나 unresolved 상태로 표시된다.

### 4.5 결과 확정 규칙

- 자동 생성 일정은 추천안이다.
- 사용자가 drag-and-drop으로 변경한 결과가 최종 표시 순서가 된다.
- 저장 기능이 제공될 경우, 저장 시점의 사용자 수정 결과를 최종 itinerary로 저장한다.

---

## 5. 화면 구성

## 5.1 화면 A: 이미지 세트 선택 및 기간 설정

구성 요소:

- 날짜+도시 기준 후보 세트 카드 목록
- 세트 선택 버튼
- 그룹 내부 이미지 미리보기
- 이미지 체크박스
- 기간 선택 UI
  - 슬라이더 또는 버튼 방식
  - 1일~5일 선택
- Generate Itinerary 버튼

예시 카드:

- 04-10-2026 | 도쿄 | 5장
- 04-10-2026 | 서울 | 3장
- 04-11-2026 | 서울 | 2장

## 5.2 화면 B: Travelize 결과 편집 화면

좌측:

- Day 1 ~ Day N 열(Column)
- 각 셀에 다음 정보 표시
  - 사진 썸네일
  - 장소명
  - 촬영 시간
- drag-and-drop으로 셀 이동 가능

우측:

- Google Maps 기반 지도 영역
- 1번부터 마지막 장소까지 polyline 표시
- 좌측 일정 순서가 바뀌면 우측 지도 경로도 즉시 갱신

---

## 6. 화면에 필요한 데이터

| 화면 요소 | 필요한 데이터 | 비고 |
|---|---|---|
| 후보 세트 카드 | `candidate_set_id`, `date_kst`, `city`, `cover_thumbnail_url`, `image_count` | 날짜+도시 기준 |
| 이미지 선택 목록 | `image_id`, `thumbnail_url`, `captured_at`, `place_name`, `latitude`, `longitude`, `is_resolved` | 체크박스 포함 |
| 기간 선택 UI | `selected_days` | 1~5 |
| 일정 표 | `day_number`, `order_index`, `image_id`, `thumbnail_url`, `place_name`, `captured_at` | drag-and-drop 대상 |
| 지도 | `latitude`, `longitude`, `order_index` | polyline 계산용 |
| 저장 상태 | `plan_id`, `is_saved`, `updated_at` | 선택 사항 |

---

## 7. 사용자 액션

| 액션 | 설명 | 결과 |
|---|---|---|
| Travelize 진입 | 메인 화면 또는 관련 진입점에서 Travelize 페이지 이동 | 후보 세트 목록 표시 |
| 세트 선택 | 특정 날짜+도시 후보 세트 선택 | 내부 이미지 목록 표시 |
| 이미지 선택 | 체크박스로 일정 생성 대상 선택 | 선택 이미지 상태 갱신 |
| 기간 선택 | 1~5일 중 하나 선택 | Day 열 개수 결정 |
| 일정 생성 | Generate Itinerary 클릭 | 자동 추천 일정 생성 |
| 일정 수정 | drag-and-drop으로 위치 이동 | 일정 순서 갱신 |
| 지도 확인 | 추천 경로 확인 | polyline 표시 |
| 일정 저장 | 최종 결과 저장 | 저장된 Travelize plan 생성 |

---

## 8. 필요한 API

| Method | Endpoint | 목적 | Auth | 요청 | 응답 |
|---|---|---|---|---|---|
| `GET` | `/api/travelize/candidates` | Travelize 사용 가능한 후보 세트 목록 조회 | 필요 | 없음 | 후보 세트 목록 |
| `GET` | `/api/travelize/candidates/{candidateSetId}/images` | 선택 후보 세트의 이미지 조회 | 필요 | path param | 이미지 목록 |
| `POST` | `/api/travelize/itineraries/generate` | 선택 이미지와 기간으로 일정 생성 | 필요 | `group_id`, `selected_image_ids`, `days` | itinerary 결과 |
| `PATCH` | `/api/travelize/itineraries/{planId}/items/reorder` | 사용자가 순서를 수정한 결과 반영 | 필요 | `day_number`, `order_index`, `item_id` | 수정된 itinerary |
| `POST` | `/api/travelize/itineraries` | 최종 itinerary 저장 | 필요 | 전체 day/item 구조 | 저장된 plan |
| `GET` | `/api/travelize/itineraries/{planId}` | 저장된 itinerary 조회 | 필요 | path param | itinerary 상세 |

---

## 9. 요청/응답 예시

### 9.1 일정 생성 요청 예시

```json
{
  "candidate_set_id": 12,
  "selected_image_ids": [101, 103, 104, 105],
  "days": 3
}
```

### 9.2 일정 생성 응답 예시

```json
{
  "plan_id": 44,
  "is_estimated": true,
  "days": [
    {
      "day_number": 1,
      "items": [
        {
          "item_id": 1,
          "image_id": 101,
          "place_name": "Fushimi Inari Shrine",
          "captured_at": "2026-04-10T09:12:00+09:00",
          "latitude": 34.9671,
          "longitude": 135.7727,
          "thumbnail_url": "/uploads/thumbs/101.jpg"
        }
      ]
    },
    {
      "day_number": 2,
      "items": [
        {
          "item_id": 2,
          "image_id": 103,
          "place_name": "Kiyomizu-dera",
          "captured_at": "2026-04-10T13:42:00+09:00",
          "latitude": 34.9948,
          "longitude": 135.785,
          "thumbnail_url": "/uploads/thumbs/103.jpg"
        }
      ]
    }
  ]
}
```

### 9.3 순서 수정 요청 예시

```json
{
  "days": [
    {
      "day_number": 1,
      "items": [
        { "item_id": 2, "order_index": 1 },
        { "item_id": 1, "order_index": 2 }
      ]
    }
  ]
}
```

---

## 10. 빈 상태 및 예외 처리

- Travelize에 사용할 수 있는 후보 세트가 없으면 빈 상태 메시지를 표시한다.
- 사용자가 이미지를 하나도 선택하지 않으면 일정 생성 버튼을 비활성화하거나 오류 메시지를 표시한다.
- 선택된 이미지 중 좌표가 없는 이미지가 있으면 해당 이미지는 unresolved 상태로 표시하거나 자동 계산에서 제외한다.
- 지도 API가 실패하더라도 일정 표 자체는 유지되어야 한다.
- 기간 선택 없이 일정 생성을 요청할 수 없다.
- 저장 실패 시 사용자에게 재시도 메시지를 제공한다.

---

## 11. 시스템 로직 문구(SRS용)

- The system shall extract available EXIF metadata, including date, time, latitude, and longitude, from selected images.
- The system shall group candidate images by KST 00:00 and city-level location data.
- The system shall allow the user to include or exclude individual images before itinerary generation.
- The system shall generate an estimated visit order based on geographic proximity of selected locations.
- The system shall distribute selected locations across a user-selected duration from one to five days.
- The system shall present the generated itinerary in a day-by-day editable table format.
- The system shall support drag-and-drop reordering of itinerary items across days.
- Any manual reordering performed by the user shall override the automatically generated order.
- Any change in itinerary order shall be reflected in the map route view in real time.
- The generated itinerary shall be presented as an estimated recommendation rather than live navigation.

---

## 12. DB/API 작업 메모

- Travelize는 image metadata를 기반으로 날짜+도시 단위 후보 세트를 생성해 사용하는 구조가 적합하다.
- image 단위로 `captured_at`, `latitude`, `longitude`, `resolved_place_name`이 저장되어 있어야 한다.
- 별도 `travel_plans`, `travel_plan_days`, `travel_plan_items` 구조로 저장하는 것이 적합하다.
- 사용자의 수동 수정 결과를 유지하려면 `order_index`, `day_number`, `is_user_modified` 같은 필드가 필요하다.
- 지도 polyline은 저장 데이터라기보다 계산 결과 또는 프론트 표시 데이터로 다루는 편이 단순하다.
