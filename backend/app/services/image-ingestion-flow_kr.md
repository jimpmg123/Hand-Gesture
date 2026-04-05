# Image Ingestion Flow

이 문서는 이미지 업로드 처리 흐름을 간단히 정리해 둔 메모입니다.

목적은 구현을 너무 일찍 고정하는 것이 아니라,  
현재 의도한 처리 순서를 텍스트로 남겨 두고 나중에 기능이 늘어날 때 쉽게 추가할 수 있게 하는 것입니다.

---

## 목적

`image_ingestion_service`는 업로드된 이미지를 처리하는 **상위 orchestration 계층**입니다.

이 파일의 역할은 모든 일을 직접 수행하는 것이 아니라,  
아래쪽의 세부 기능들을 올바른 순서로 연결하는 것입니다.

대표적인 하위 기능 예:

- EXIF 메타데이터 추출
- CLIP 분석
- OpenAI 기반 해석
- Geocoding
- Weather 조회
- DB 저장

---

## 현재 최소 흐름

```text
Frontend에서 이미지 업로드
-> router가 UploadFile 수신
-> image_ingestion_service가 처리 시작
-> 필요하면 임시 파일 생성
-> EXIF 메타데이터 추출
-> GPS 존재 여부 확인
-> metadata_case 지정
   - gps_present
   - gps_missing
-> 응답용 payload 생성
-> 임시 파일 삭제
-> 결과 반환
```

---

## 현재 의도된 로직

현재 기준으로는 아래 흐름을 의도하고 있습니다.

1. API route에서 업로드 이미지를 받는다.
2. EXIF service를 호출해 메타데이터를 추출한다.
3. GPS 정보가 있는지 확인한다.
4. 다음과 같은 간단한 분류 필드를 추가한다.
   - `has_gps`
   - `metadata_case`
5. API 응답용 payload를 만든다.
6. 이후 필요하면 repository 계층을 통해 DB에 저장한다.

---

## 앞으로 확장될 가능성이 큰 흐름

이 프로젝트에서 앞으로 자연스럽게 확장될 가능성이 높은 흐름은 아래와 같습니다.

```text
Frontend에서 이미지 업로드
-> router가 파일 수신
-> image_ingestion_service가 orchestration 시작
-> 임시/로컬 처리용 파일 준비
-> EXIF 메타데이터 추출
-> GPS 존재 여부 확인
   -> yes:
      -> gps_present 처리
      -> 필요하면 reverse geocoding
   -> no:
      -> gps_missing 처리
      -> CLIP 분석
      -> 필요하면 landmark detection
      -> 필요하면 OCR fallback
      -> 필요하면 OpenAI 해석
-> 추출 정보와 추정 정보를 결합
-> repository를 통해 저장
-> 구조화된 API 응답 반환
```

---

## 나중에 확장할 수 있는 지점

다음 위치들은 앞으로 기능을 추가하기 좋은 지점입니다.

### EXIF 추출 직후

여기서는 이런 처리가 들어갈 수 있습니다.

- GPS 존재 여부 확인
- 카메라/시간 정보 검증
- 메타데이터 정규화

### GPS 분기 이후

여기서는 이런 처리가 들어갈 수 있습니다.

- CLIP 장면 분석
- landmark detection
- OCR fallback
- geocoding

### 저장 직전

여기서는 이런 처리가 들어갈 수 있습니다.

- raw metadata와 추론 결과 병합
- status 부여
- 최종 API 응답 형태 구성

### 저장 이후

여기서는 이런 처리가 들어갈 수 있습니다.

- 분석 이력 저장
- 후속 작업 트리거
- Travelize 또는 AI Trip Journal 기능과 연결

---

## 간단한 설계 원칙

이 service는 **흐름 조정**을 담당하고, 세부 구현은 하위 계층에 남겨 두는 것이 좋습니다.

즉:

- 실제 EXIF 파싱은 `exif_service`
- 실제 CLIP 추론은 `clip_service`
- 실제 DB insert/update는 `repositories`
- `image_ingestion_service`는 이들을 순서대로 연결

---

## 왜 이 문서를 텍스트로 따로 두는가

구현은 앞으로 계속 바뀔 가능성이 큽니다.

예:

- 새로운 API가 추가될 수 있음
- DB 모델이 확장될 수 있음
- Travelize가 구현될 수 있음
- AI Trip Journal 기능이 붙을 수 있음

그래서 이 문서는 현재 코드를 너무 일찍 고정하기 위한 문서가 아니라,  
앞으로도 수정하기 쉬운 흐름 메모로 유지하는 것이 목적입니다.
