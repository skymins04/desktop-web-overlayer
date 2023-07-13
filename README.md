# desktop-web-overlayer

데스크탑 화면에 웹 페이지 오버레이를 띄울 수 있는 Electron 유틸리티

## Commands

```sh
# 패키지 설치
pnpm install

# 개발 환경 실행
pnpm dev

# 빌드
pnpm build

# 프로덕션 환경 실행 (빌드를 우선 실행 해야함)
pnpm start

# electron app에만 pnpm 명령 실행
# ex) pnpm --filter @desktop-web-overlayer/electron add react-hook-form
pnpm --filter @desktop-web-overlayer/electron {commands}

# view app에만 pnpm 명령 실행
# ex) pnpm --filter @desktop-web-overlayer/view add react-hook-form
pnpm --filter @desktop-web-overlayer/view {commands}
```
