# AI Trip Journal 처리 규칙

이 문서는 AI Trip Journal 기능의 처리 흐름을 정리한다.
DB 테이블 구조만이 아니라, 이미지가 observation과 segment로 변환되는 방식과
POI, CLIP, document classification, weather cache가 어떤 순서로 사용되는지를 설명한다.

## 1. 기본 원칙

- Journal은 원본 EXIF 시간이 있는 이미지와 원본 EXIF GPS가 있는 이미지에만 적용한다.
- landmark detection, OCR, OpenAI 등으로 추론된 좌표만 있는 이미지는 Journal 입력으로 사용하지 않는다.
- Journal은 raw image를 바로 segment로 만들지 않고, 먼저 observation 계층을 만든 뒤 segment를 생성한다.
- 최종 segment는 `stay`, `transit`, `uncertain` 세 가지 타입으로 관리한다.

## 2. Journal 입력 조건

저널에 포함될 수 있는 이미지는 다음 조건을 모두 만족해야 한다.

- `has_exif_datetime = true`
- `has_exif_gps = true`

즉, 직접 촬영된 사진처럼 정확한 촬영 시각과 GPS가 모두 존재해야 한다.

## 3. Observation 생성 규칙

Journal은 먼저 burst 이미지를 observation으로 묶는다.

### Observation 정의

Observation은 "같은 순간에 촬영된 이미지 묶음"이다.

### Observation 묶음 조건

새 이미지가 현재 observation에 포함되려면 다음을 만족해야 한다.

- 새 이미지와 observation 첫 이미지의 시간 차이가 `10초 이하`
- 새 이미지와 observation 중심 좌표의 거리가 `30m 이하`

주의:

- 인접 이미지끼리 10초 체인으로 묶지 않는다.
- 즉 `1->2`, `2->3`이 각각 10초 이하여도, `1->3`이 10초를 넘으면 같은 observation으로 보지 않는다.

### Observation 결과

각 observation은 다음 정보를 가진다.

- representative image
- observation start/end time
- center latitude / longitude
- image count
- country / city snapshot

프론트엔드에서는 observation 안에 이미지가 여러 장이면 대표 이미지 우측 상단에 `+n` 배지로 표시할 수 있다.

## 4. Segment 생성 방식

Observation이 만들어진 뒤, observation들을 묶어 segment 초안을 만든다.

### 중요한 원칙

- observation이 1장뿐이어도 segment 후보가 될 수 있다.
- 즉 "여러 장이 모여야만 segment가 된다"가 아니다.
- single observation도 일단 provisional segment 후보로 만든 뒤 분류한다.

### Segment 정의

Segment는 Journal의 실제 시간 구간 단위다.

- `stay`: 한 장소에 머문 구간
- `transit`: 장소와 장소 사이를 이동한 구간
- `uncertain`: 자동 판정이 애매한 구간

### Segment와 Observation의 관계

- observation은 순간 단위
- segment는 여러 observation을 묶은 체류/이동 단위

즉 구조는 다음과 같다.

```text
raw images -> observations -> segments
```

## 5. Stay / Transit 분류 원칙

Journal은 모든 stay를 정확히 확정하는 방식보다,
강한 stay 신호와 강한 transit 신호를 먼저 잡고 나머지는 uncertain으로 남기는 방식을 사용한다.

### 1차 신호: 시간 + GPS

기본 분류는 시간과 GPS를 기준으로 한다.

확인 항목:

- 이전 / 다음 observation과의 시간 차
- 이전 / 다음 observation과의 거리
- observation 자체 duration
- timeline 상 앞뒤 observation과의 흐름

### 2차 신호: POI

Observation이 singleton이거나 애매한 경우, nearby place를 조회해서 보정한다.

예시:

- destination-like POI
  - `restaurant`
  - `cafe`
  - `museum`
  - `tourist_attraction`
  - `lodging`
  - `park`
  - `shrine`
- transit-like POI
  - `train_station`
  - `subway_station`
  - `bus_station`
  - `airport`
  - `transit_station`

POI는 메인 판정 규칙이 아니라 보조 신호다.
POI가 있다고 무조건 stay가 되지는 않는다.

### 3차 신호: CLIP Journal Classifier

Observation의 이미지 맥락을 보기 위해 Journal 전용 CLIP 분류를 사용한다.

추천 label:

- `destination_scene`
- `transport_related_scene`
- `food_photo`
- `document_like`
- `generic_scene`

### 4차 신호: Document Classification

Observation이 document-like로 보이면 OCR 또는 multimodal classifier를 통해 subtype을 구분한다.

예시 subtype:

- `transport_ticket`
- `lodging_confirmation`
- `museum_ticket`
- `receipt`
- `map_screenshot`
- `generic_document`

문서 subtype은 stay/transit 가중치 조정에 사용한다.

## 6. 분류 전략

### Strong Stay Anchor

다음은 강한 stay 신호다.

- destination-like POI
- 음식 사진
- destination_scene
- observation 여러 개가 같은 장소에서 시간 차를 두고 반복됨

### Strong Transit Anchor

다음은 강한 transit 신호다.

- transit-like POI
- transport_related_scene
- 앞뒤 stay anchor 사이의 중간 위치 / 중간 시점
- 이동 경로처럼 좌표가 계속 진행되는 경우

### Uncertain

다음은 uncertain으로 남긴다.

- POI가 약함
- scene label이 generic
- 한 장짜리 singleton이며 맥락이 부족함
- stay인지 transit인지 어느 쪽도 강하지 않음

## 7. Weather 처리 규칙

Weather는 모든 업로드 이미지에 대해 미리 계산하지 않는다.

### 호출 시점

- Journal 생성 시점에만 weather lookup을 수행한다.

### cache key

- `provider + country + city + weather_date`

이렇게 하면 같은 도시, 같은 날짜의 여러 이미지가 있어도 weather API를 반복 호출하지 않아도 된다.

## 8. LLM 생성 규칙

LLM은 raw image 배열을 받아서 segment를 처음부터 찾는 역할을 하지 않는다.

백엔드가 먼저 다음을 만든다.

- ordered observations
- final segments
- segment type
- segment time range
- segment location labels
- weather summary
- user notes

그 다음 LLM은 이 구조를 바탕으로 저널 텍스트를 생성한다.

즉 역할 분리는 다음과 같다.

- backend: observation/segment 구조 생성
- LLM: 구조를 바탕으로 narrative 생성

## 9. 구현 단위 제안

권장 서비스 분리:

- `journal_eligibility_service.py`
- `observation_builder_service.py`
- `places_service.py`
- `clip_journal_service.py`
- `segment_classifier_service.py`
- `segment_builder_service.py`
- `weather_service.py`
- `journal_generation_service.py`

## 10. DB 계층 요약

Journal 관련 핵심 테이블:

- `trip_journals`
- `trip_journal_observations`
- `trip_journal_observation_images`
- `trip_journal_segments`
- `weather_cache`

역할:

- `trip_journal_observations`: burst collapse 이후의 관측 단위
- `trip_journal_observation_images`: observation과 원본 이미지 연결
- `trip_journal_segments`: stay / transit / uncertain 최종 구간
- `weather_cache`: 도시 + 날짜 기반 날씨 재사용
