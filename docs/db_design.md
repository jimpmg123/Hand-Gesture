users
├── user_privacy_settings
├── uploaded_images
│   ├── image_exif_metadata
│   ├── image_analysis_runs
│   ├── image_labels
│   └── image_place_candidates ─── places
├── gallery_groups ─── gallery_group_images ─── uploaded_images
├── travel_plans
│   ├── travel_plan_selected_images ─── uploaded_images
│   └── travel_plan_days
│       └── travel_plan_items ─── places
└── trip_journals
    ├── trip_journal_images ─── uploaded_images
    ├── trip_journal_segments ─── places
    │                           └── historical_weather_cache
    └── trip_journal_entries


즉 `db_design_normalized`는  
“우리 프로젝트의 DB를 어떤 테이블들로 나눠서 저장할지”를 정리한 문서입니다.

**4. `normalized`가 왜 붙나**

이건 “정규화된 설계”라는 뜻입니다.  
쉽게 말하면 중복을 줄이고, 한 정보는 한 곳에만 저장되게 하는 겁니다.

예:
- 이미지 파일 정보는 `uploaded_images`
- EXIF 정보는 `image_exif_metadata`
- 장소 후보는 `image_place_candidates`

이렇게 나누는 이유:
- 이미지 파일 자체와 EXIF는 성격이 다름
- 나중에 EXIF가 없을 수도 있음
- 한 이미지에 후보 장소는 여러 개일 수 있음

즉 정규화는  
“정보를 억지로 한 테이블에 다 몰아넣지 않고, 관계에 맞게 분리하는 것”입니다.

**5. `postgres_dump_instructions`는 필요한가**

꼭 필요한 건 아닙니다.

이건 보통 “실제로 만든 DB를 파일로 내보내는 방법”을 적어놓은 문서입니다.  
MySQL이면 `mysqldump`, PostgreSQL이면 `pg_dump`를 씁니다.

이 문서가 필요한 경우:
- 과제 제출물에 DB dump 파일이 포함되어야 할 때
- 팀원이 같은 DB 상태를 재현해야 할 때
- 실제 생성된 테이블/데이터를 백업해야 할 때

안 필요한 경우:
- 이번에 설계 문서만 제출하면 되는 경우
- 아직 실제 DB 구현보다 설계 단계가 핵심인 경우

즉 지금 단계에서는 `db_design_normalized`가 더 중요하고,  
`postgres_dump_instructions`는 과제 요구사항에 dump 제출이 있으면 그때 만드는 문서입니다.

**6. 지금 이 프로젝트의 실제 DB 상태**

현재 코드 기준으로 실제 ORM 모델은 거의 하나뿐입니다.

실제 존재:
- [user.py](/E:/CSE%20416/Travel-from-photo/backend/app/models/user.py)
  - `users` 테이블

즉 지금은:
- DB 연결은 있음
- SQLAlchemy도 있음
- PostgreSQL도 연결 가능
- 하지만 실제 테이블은 거의 아직 안 만들어진 상태

그래서 지금 필요한 건  
“현재 코드 + 프론트 페이지 + SRS를 보고 전체 DB 구조를 설계하는 것”입니다.

**7. 이 프로젝트 DB를 어떻게 이해하면 되나**

이 프로젝트는 크게 6개 덩어리로 보면 이해가 쉽습니다.

**A. 사용자 영역**
- 누가 로그인했는지
- traveler인지 admin인지
- 개인정보/설정이 뭔지

핵심 테이블:
- `users`
- `user_privacy_settings`

**B. 업로드 이미지 영역**
- 사용자가 올린 원본 이미지
- 파일 이름, 경로, 크기
- EXIF에서 뽑은 시간/GPS

핵심 테이블:
- `uploaded_images`
- `image_exif_metadata`

**C. 이미지 분석 결과 영역**
- 이 사진이 어떤 장소처럼 보이는지
- CLIP 결과
- landmark 결과
- 장소 후보 여러 개

핵심 테이블:
- `image_analysis_runs`
- `image_labels`
- `places`
- `image_place_candidates`

여기서 중요한 개념:
- `raw data`와 `AI 결과`를 분리해야 함
- EXIF는 비교적 “원본 사실”
- CLIP/landmark 후보는 “추정 결과”

**D. 갤러리 영역**
- 사용자가 이미지를 묶어서 보는 그룹
- 도시별, 여행별, 음식별 그룹
- 그룹 안에 여러 이미지

핵심 테이블:
- `gallery_groups`
- `gallery_group_images`

이건 현재 [GalleryPage.tsx](/E:/CSE%20416/Travel-from-photo/frontend/src/app/pages/GalleryPage.tsx), [ImagesPage.tsx](/E:/CSE%20416/Travel-from-photo/frontend/src/app/pages/ImagesPage.tsx)와 직접 연결됩니다.

**E. Travelize 영역**
- 갤러리 그룹을 고름
- 그 안의 이미지 일부를 체크박스로 선택
- 1~5일 일정 생성
- day-by-day로 저장

핵심 테이블:
- `travel_plans`
- `travel_plan_selected_images`
- `travel_plan_days`
- `travel_plan_items`

여기서 중요한 점:
- “선택된 이미지”는 여러 장이 될 수 있으므로 별도 join table이 필요함
- 하루가 여러 개이므로 `travel_plan_days`
- 각 day 안에 방문 순서가 있으므로 `travel_plan_items`

**F. AI Trip Journal 영역**
- 여러 이미지 업로드
- 이미지별 노트
- 시간순 정렬
- 스타일 선택
- segment 추정
- weather 추정/조회
- 최종 저널 생성

핵심 테이블:
- `trip_journals`
- `trip_journal_images`
- `trip_journal_segments`
- `trip_journal_entries`
- `historical_weather_cache`

여기서 중요한 점:
- 이미지마다 유저 메모가 따로 있을 수 있음
- 저널 전체 결과와 이미지별 정보는 분리해야 함
- “정확한 시간/좌표”와 “추정 이동시간/머문 시간”은 구분해서 저장해야 함

**8. 왜 이렇게 테이블이 많아지나**

처음엔 많아 보여도 이유가 있습니다.

예를 들어 Travelize를 한 테이블에 다 넣으려고 하면:
- 어떤 이미지를 썼는지
- 며칠 일정인지
- day 1, day 2, day 3
- 각 day의 장소 순서
이걸 한 줄에 다 넣어야 해서 구조가 금방 꼬입니다.

그래서 보통 이렇게 쪼갭니다.
- 계획 자체: `travel_plans`
- 며칠차: `travel_plan_days`
- 각 날의 방문 장소: `travel_plan_items`

이게 DB 설계의 핵심입니다.
“한 줄이 한 종류의 사실만 담게 만든다.”

**9. 이 프로젝트에서 특히 중요한 설계 원칙**

이 프로젝트는 아래 두 가지를 분리하는 게 매우 중요합니다.

- `정확한 정보`
  - EXIF 시간
  - GPS 좌표
  - 실제 업로드 파일
- `추정된 정보`
  - CLIP 라벨
  - landmark 후보
  - itinerary 추천
  - journal narrative
  - estimated stay/movement/weather

이걸 섞어버리면 나중에:
- 뭐가 진짜 파일에서 나온 값인지
- 뭐가 AI가 추정한 값인지
구분이 안 됩니다.

그래서 Travelize/Journal DB는
`exact vs estimated`를 분리하는 방향이 중요합니다.

**10. 지금 `db_design_normalized`를 만들 때 들어갈 정보 요약**

이 문서에는 보통 이런 것들이 들어갑니다.

- `users`
  - 계정 정보
- `user_privacy_settings`
  - 관리자 접근 허용 여부
- `uploaded_images`
  - 원본 이미지 파일 정보
- `image_exif_metadata`
  - 추출된 EXIF/GPS
- `places`
  - 재사용 가능한 장소/식당/랜드마크
- `image_place_candidates`
  - 이미지별 장소 후보
- `gallery_groups`
  - 갤러리 그룹
- `gallery_group_images`
  - 그룹-이미지 연결
- `travel_plans`
  - 일정 생성 결과
- `travel_plan_days`
  - 일정의 날짜 단위
- `travel_plan_items`
  - 날짜별 방문 항목
- `trip_journals`
  - 여행 저널
- `trip_journal_images`
  - 저널에 포함된 이미지와 메모
- `trip_journal_segments`
  - 방문 구간/이동 구간
- `trip_journal_entries`
  - 최종 narrative 내용
- `historical_weather_cache`
  - 날씨 조회 캐시

**11. 아주 짧게 정리하면**

- 프론트 페이지를 만들고 나면, 그 페이지가 필요로 하는 데이터를 주는 백엔드 API를 만든다
- 그 API가 DB에서 읽고 저장한다
- `db_design_normalized`는 그 DB의 테이블 구조를 정리한 설계 문서다
- `postgres_dump_instructions`는 실제 DB를 dump로 뽑아야 할 때만 필요하다
- 이 프로젝트의 DB는 크게
  - 사용자
  - 업로드 이미지
  - 메타데이터/분석 결과
  - 갤러리
  - Travelize 일정
  - AI Trip Journal
  로 나눠서 이해하면 쉽다

