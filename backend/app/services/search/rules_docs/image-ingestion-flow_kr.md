# Image Ingestion Flow

이 문서는 이미지 업로드 처리 흐름을 간단하게 정리해 둔 메모입니다.

목적은 구현을 완전히 고정하는 것이 아니라, 현재 기준 처리 순서를 텍스트로 남겨 두고 이후 기능이 추가될 때 어디에 붙일지 쉽게 판단할 수 있도록 하는 것입니다.

---

## 목적

`image_ingestion_service`는 업로드된 이미지를 처리하는 **상위 orchestration 계층**입니다.

이 서비스가 모든 세부 작업을 직접 수행하는 것은 아닙니다.  
아래쪽의 개별 서비스들을 올바른 순서로 연결하는 역할을 맡습니다.

대표적으로 연결되는 하위 기능은 다음과 같습니다.

- EXIF 메타데이터 추출
- CLIP gate 분류
- CLIP 장면 힌트 분류
- Landmark detection
- OpenAI 기반 이미지 해석
- Geocoding / reverse geocoding
- DB 저장

---

## 현재 권장 처리 순서

```text
Frontend에서 이미지 업로드
-> router가 UploadFile 수신
-> image_ingestion_service가 처리 시작
-> 필요하면 임시 파일 생성
-> EXIF 메타데이터 추출
-> GPS 존재 여부 확인
   -> GPS 있음:
      -> 좌표 사용
      -> 필요하면 reverse geocoding
   -> GPS 없음:
      -> CLIP gate 분류 실행
      -> 장소 추론 불가능 이미지면 실패 처리
      -> 장소 추론 가능한 이미지면 CLIP 장면 힌트 추출
      -> Landmark detection 실행
      -> Landmark 실패 시 OpenAI 이미지 해석 실행
-> 추출/추론 결과 병합
-> repository를 통해 DB 저장
-> API 응답 반환
```

---

## CLIP의 역할

CLIP은 최종 위치 판별기가 아닙니다.

이 프로젝트에서 CLIP의 역할은 두 가지입니다.

### 1. Gate 분류

먼저 이 이미지가 장소 추론에 쓸 만한 이미지인지 확인합니다.

예시:

- 통과:
  - 여행 장면 사진
  - 도시 거리
  - 수변 장면
  - 신사/유적/플랫폼 같은 공공 장면
- 탈락:
  - 음식 클로즈업
  - 얼굴 중심 셀카
  - 오브젝트 근접샷
  - 장소 추론이 거의 불가능한 사적 실내 사진

### 2. 장면 힌트 추출

Gate를 통과한 이미지에 대해서만 장면 대분류 힌트를 뽑습니다.

예시:

- `river scene`
- `sea or beach`
- `lake or waterfront`
- `temple or shrine`
- `historic site or ruin`
- `urban street`
- `market street`
- `mountain landscape`
- `transport-related scene`

이 결과는 이후 Landmark detection이나 OpenAI 단계에서 **약한 힌트**로만 사용합니다.

---

## 현재 기준 세부 로직

현재 기준으로는 아래 순서로 로직을 확장하는 것을 권장합니다.

1. API route에서 업로드 이미지를 받는다.
2. EXIF service를 호출해 메타데이터를 추출한다.
3. GPS 정보가 있으면 그 좌표를 우선 사용한다.
4. GPS 정보가 없으면 CLIP gate 분류를 실행한다.
5. Gate에서 탈락하면 위치 추론 실패 이미지로 처리한다.
6. Gate를 통과하면 CLIP 장면 힌트를 추출한다.
7. Landmark detection을 실행한다.
8. Landmark detection이 실패하면 OpenAI 이미지 해석을 실행한다.
9. 최종 좌표/주소/장면 힌트/상태를 합쳐 payload를 만든다.
10. 이후 필요하면 repository 계층을 통해 DB에 저장한다.

---

## 앞으로 확장 가능한 흐름

이 프로젝트에서 이후 자연스럽게 확장 가능한 흐름은 아래와 같습니다.

```text
Frontend에서 이미지 업로드
-> router가 파일 수신
-> image_ingestion_service가 orchestration 시작
-> 임시 파일 / 로깅 준비
-> EXIF 메타데이터 추출
-> GPS 존재 여부 확인
   -> yes:
      -> GPS 좌표 사용
      -> reverse geocoding
   -> no:
      -> CLIP gate 분류
      -> gate reject면 failed 처리
      -> gate pass면 CLIP 장면 힌트 추출
      -> Landmark detection
      -> 실패 시 OpenAI 이미지 해석
      -> 필요하면 Geocoding / Places 결합
-> raw metadata + 추론 결과 병합
-> repository를 통한 저장
-> 구조화된 API 응답 반환
```

---

## 확장 포인트

다음 위치들은 이후 기능을 붙이기 좋은 지점입니다.

### EXIF 추출 직후

- GPS 존재 여부 확인
- 촬영 시간 검증
- 카메라 정보 정리

### GPS 없음 분기 직후

- CLIP gate
- CLIP 장면 힌트
- Landmark detection
- OpenAI fallback

### 최종 결과 병합 직전

- raw metadata와 추론 결과 병합
- 최종 status 결정
- failure reason 정리

### DB 저장 직전

- image metadata 저장
- 분석 결과 캐시 저장
- Travelize / Journal용 후속 데이터 연결

---

## 설계 원칙

`image_ingestion_service`는 **흐름 조정자** 역할에 집중하는 것이 좋습니다.

즉:

- 실제 EXIF 파싱은 `exif_service`
- 실제 CLIP 추론은 `clip_service`
- 실제 Landmark 호출은 `landmark_detection_service`
- 실제 DB insert / update는 `repositories`
- `image_ingestion_service`는 이들을 순서대로 연결

---

## 왜 문서로 먼저 남기는가

이 흐름은 앞으로 계속 바뀔 가능성이 있습니다.

예를 들면:

- OpenAI 호출 규칙이 달라질 수 있음
- DB 모델이 확장될 수 있음
- Travelize / AI Trip Journal과 연결이 강화될 수 있음

그래서 이 문서는 현재 코드를 영구 고정하는 문서가 아니라, 이후에도 수정하기 쉬운 흐름 메모로 유지하는 것이 목적입니다.
