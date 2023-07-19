# DESKTOP WEB OVERLAYER

---

데스크탑 화면에 웹 페이지 오버레이들을 띄울 수 있는 Electron 유틸리티

![readme-1](assets/readme-1.png)

## Download

```sh
git clone https://github.com/skymins04/desktop-web-overlayer
```

또는
[GitHub Release 최신버전 다운로드 링크](https://github.com/skymins04/desktop-web-overlayer/releases/latest)

## Commands

```sh
# 패키지 설치
pnpm install

# 개발 환경 실행
pnpm dev

# 빌드
pnpm build

# 빌드 (캐시 무시)
pnpm build --force

# 프로덕션 환경 실행 (빌드를 우선 실행 해야함)
pnpm start

# 실행파일 빌드 (빌드를 우선 실행해야함)
pnpm deploy:mac # mac
pnpm deploy:win32 # windows 32bit
pnpm deploy:win64 # windows 64bit
pnpm deploy:all # 전체 아키텍쳐 모두 빌드

# electron app에만 pnpm 명령 실행
# ex) pnpm --filter @desktop-web-overlayer/electron add react-hook-form
pnpm --filter @desktop-web-overlayer/electron {commands}

# view app에만 pnpm 명령 실행
# ex) pnpm --filter @desktop-web-overlayer/view add react-hook-form
pnpm --filter @desktop-web-overlayer/view {commands}
```

## Tech Stack

| 분류                       | 적용기술                                    |
| -------------------------- | ------------------------------------------- |
| **Package manager**        | pnpm (pnpm workspace monorepo)              |
| **Parallel execution**     | Ultra runner                                |
| **Framework / UI Library** | Electron + React                            |
| **Bundler**                | Vite                                        |
| **Styling**                | Tailwind CSS + Mantine                      |
| **Validation**             | react-hook-form + zod + @hookform/resolvers |

## Features

- 데스크탑 화면에 여러 웹페이지를 오버레이 위젯으로 배치할 수 있는 기능
- 시스템트레이 빠른메뉴 제공
- 오버레이 위젯 세부 기능
  - 오버레이 창 위치/크기 저장 기능
  - 오버레이 창 외곽선 표시/숨김 기능
  - 오버레이 마우스 클릭 및 상호작용 비활성화 기능
  - 오버레이 투명 배경 기능
  - 오버레이 창 전체 투명도 조절 기능
  - 오버레이 웹페이지의 CSS 커스터마이징 기능
  - 오버레이 폰트 크기 조절 기능

<p align="center">
  <img src="assets/readme-5.png" style="width: 400px; margin: 0 auto;" />
</p>
<p>
  <img src="assets/readme-7.png" style="width: 33%;" />
  <img src="assets/readme-8.png" style="width: 33%;" />
  <img src="assets/readme-9.png" style="width: 33%;" />
<p>
<img src="assets/readme-2.png" />
<img src="assets/readme-6.png" />
<img src="assets/readme-3.png" />
<img src="assets/readme-4.png" />

## Known Issues

- Mac dmg 인증서 문제
  - 현재 Mac용 dmg 파일들을 직접 브라우저를 통해 다운로드 받으면 MacOS 상에서 인증서가 적용되지 않은 이미지라는 이유로 실행을 시키지 않음.
  - **"curl -LO {dmg file url}"** 이 명령어를 통해 dmg 파일을 다운로드 받아야 정상적으로 실행이 가능함.
  - 1.0.2 dmg download ex:
    - curl -LO https://github.com/skymins04/desktop-web-overlayer/releases/download/1.0.2/Desktop-Web-Overlayer-1.0.2-arm64.dmg

## License

MIT License  
Copyright (c) 2023 Minsu Kang (BetaMan)
