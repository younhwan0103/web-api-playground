---
title: BroadcastChannel
summary: 같은 출처(origin)의 탭·창·iframe끼리 서버 없이 메시지를 주고받는다.
demo: broadcast
order: 1
---

## 알아둘 것

- **보낸 쪽은 자기 메시지를 받지 못한다.** 다른 컨텍스트에만 전달되므로, 보낸 탭의 화면은 직접 갱신해야 한다.
- 같은 출처끼리만 통신한다. 다른 도메인과는 불가.
- 서버를 거치지 않으므로 **다른 기기와는 통신할 수 없다.** 그건 WebSocket의 영역이다.
- `channel.close()`를 정리 단계에서 호출하지 않으면 채널이 쌓인다.
