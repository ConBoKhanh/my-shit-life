# TADPOLE RACE — GAME DEVELOPMENT SPECIFICATION

## 1. Tổng quan

Xây dựng một game đua nòng nọc 2D bằng React.js.

Người chơi điều khiển 1 con nòng nọc và đua với khoảng 20 con nòng nọc BOT.

### Mục tiêu gameplay

- Điều khiển nòng nọc của người chơi vượt qua các BOT.
- Hai bên đường đua có vạch biên.
- Khi nòng nọc chạm vạch biên, nòng nọc bị giảm tốc trong một khoảng thời gian.
- Nòng nọc người chơi có tốc độ cơ bản nhanh hơn BOT **1.2 lần**.
- BOT có tốc độ và chuyển động khác nhau nhẹ để cuộc đua tự nhiên hơn.
- Khi bất kỳ nòng nọc nào cán đích đầu tiên, game kết thúc.
- Winner được random một nghề nghiệp.
- Có màn hình thông báo người chiến thắng và nút chơi lại.
- Game chạy tốt trên Desktop và Mobile.
- Mobile hỗ trợ cả Portrait và Landscape.

Mặc định:

```text
1 Player
+
20 BOT
=
21 Tadpoles
```

---

# 2. Công nghệ đề xuất

## Core

- React
- TypeScript
- Vite

## Rendering

Sử dụng:

```text
HTML5 Canvas
```

Canvas chịu trách nhiệm render game.

React chịu trách nhiệm UI.

Không tạo 21 DOM element riêng để animate trong game loop.

## Game loop

Sử dụng:

```text
requestAnimationFrame
```

## State management

Có thể sử dụng:

```text
Zustand
```

Nhưng chỉ dùng Zustand cho state cấp UI/game status.

Không lưu vị trí x/y của từng nòng nọc trong React state hoặc Zustand.

## Audio

Có thể sử dụng:

```text
Howler.js
```

## Physics

MVP **không bắt buộc** dùng physics engine.

Có thể tự xử lý collision đơn giản.

Nếu gameplay sau này cần physics phức tạp hơn, có thể tích hợp:

```text
Matter.js
```

Không thêm Matter.js nếu chưa thực sự cần.

## Icon

Có thể sử dụng:

```text
lucide-react
```

---

# 3. Kiến trúc tổng thể

Luồng kiến trúc:

```text
Keyboard
    ↓
KeyboardController
    ↓
       InputState
    ↑
TouchController
    ↑
Virtual Joystick

InputState
    ↓
GameEngine
    ↓
Movement System
Collision System
Bot AI System
Finish System
Boundary System
    ↓
Canvas Renderer
```

React:

```text
React UI
├── Start Screen
├── Countdown
├── HUD
├── Mobile Controls
├── Pause UI
└── Winner Modal
```

React không chạy physics mỗi frame.

---

# 4. Cấu trúc thư mục đề xuất

```text
src/
├── app/
│   ├── App.tsx
│   └── routes.tsx
│
├── components/
│   ├── GameCanvas/
│   │   ├── GameCanvas.tsx
│   │   └── gameCanvas.css
│   │
│   ├── HUD/
│   │   ├── GameHUD.tsx
│   │   └── gameHud.css
│   │
│   ├── MobileControls/
│   │   ├── MobileControls.tsx
│   │   └── mobileControls.css
│   │
│   ├── Countdown/
│   │   └── Countdown.tsx
│   │
│   ├── WinnerModal/
│   │   └── WinnerModal.tsx
│   │
│   └── StartScreen/
│       └── StartScreen.tsx
│
├── game/
│   ├── GameEngine.ts
│   ├── GameLoop.ts
│   ├── GameState.ts
│   ├── GameConfig.ts
│   │
│   ├── entities/
│   │   ├── Tadpole.ts
│   │   ├── PlayerTadpole.ts
│   │   └── BotTadpole.ts
│   │
│   ├── systems/
│   │   ├── MovementSystem.ts
│   │   ├── CollisionSystem.ts
│   │   ├── BotAISystem.ts
│   │   ├── FinishSystem.ts
│   │   └── BoundarySystem.ts
│   │
│   ├── rendering/
│   │   ├── Renderer.ts
│   │   ├── TadpoleRenderer.ts
│   │   ├── TrackRenderer.ts
│   │   └── EffectsRenderer.ts
│   │
│   ├── input/
│   │   ├── KeyboardController.ts
│   │   ├── TouchController.ts
│   │   └── InputState.ts
│   │
│   └── utils/
│       ├── random.ts
│       ├── math.ts
│       └── collision.ts
│
├── store/
│   └── gameStore.ts
│
├── data/
│   └── professions.ts
│
├── styles/
│   └── global.css
│
└── main.tsx
```

---

# 5. Game screen

Game screen là đường đua 2D.

Concept:

```text
┌──────────────────────────────────────────────┐
│                                              │
│   |                                      |   │
│   |      TADPOLE → →                     |   │
│   |           TADPOLE →                  |   │
│   |    TADPOLE →                         |   │
│   |                    TADPOLE →         |   │
│   |                                      |   │
│   |                              🏁      |   │
│   |                                      |   │
└──────────────────────────────────────────────┘
```

Có:

```text
LEFT BOUNDARY
RIGHT BOUNDARY
FINISH LINE
```

Đường đua có thể dài hơn vùng nhìn thấy.

---

# 6. Tadpole entity

Tạo base entity:

```ts
interface Tadpole {
  id: string;

  x: number;
  y: number;

  velocityX: number;
  velocityY: number;

  baseSpeed: number;

  radius: number;

  isFinished: boolean;
  isSlowed: boolean;

  slowRemaining: number;
}
```

Player và BOT có thể kế thừa hoặc sử dụng cùng entity model.

---

# 7. Player

Chỉ có 1 player.

Tốc độ:

```text
PLAYER_SPEED = BOT_SPEED × 1.2
```

Ví dụ:

```ts
const BOT_SPEED = 100;
const PLAYER_SPEED = BOT_SPEED * 1.2;
```

Không hard-code con số 1.2 ở nhiều nơi.

Đặt trong:

```text
game/GameConfig.ts
```

---

# 8. Keyboard controls

Desktop hỗ trợ:

```text
W
A
S
D

ArrowUp
ArrowDown
ArrowLeft
ArrowRight
```

Mapping:

```text
W / ArrowUp       → UP
S / ArrowDown     → DOWN
A / ArrowLeft     → LEFT
D / ArrowRight    → RIGHT
```

Hỗ trợ nhấn nhiều phím cùng lúc:

```text
W + D
W + A
S + D
S + A
```

để di chuyển diagonal.

Phải normalize vector để diagonal không nhanh hơn movement bình thường.

Ví dụ:

```ts
if (length > 1) {
  direction.x /= length;
  direction.y /= length;
}
```

---

# 9. Mobile controls

Mobile không sử dụng keyboard.

Tạo virtual joystick theo phong cách game MOBA.

## Portrait

Khi điện thoại đứng:

```text
┌──────────────────────┐
│                      │
│                      │
│      GAME AREA       │
│                      │
│                      │
│        JOYSTICK      │
│           ◉          │
└──────────────────────┘
```

Joystick nằm gần giữa phía dưới màn hình.

## Landscape

Khi điện thoại nằm ngang:

```text
┌────────────────────────────────────────────┐
│                                            │
│                 GAME AREA                  │
│                                            │
│                                      ◉     │
│                                   JOYSTICK  │
│                                            │
└────────────────────────────────────────────┘
```

Joystick nằm phía bên phải.

### Important

Không hard-code vị trí joystick bằng JavaScript.

Ưu tiên:

```css
position: fixed;
```

và CSS media query/orientation.

Ví dụ:

```css
.mobile-controls {
  position: fixed;
  touch-action: none;
}

@media (orientation: portrait) {
  .mobile-controls {
    bottom: 10%;
    left: 50%;
    transform: translateX(-50%);
  }
}

@media (orientation: landscape) {
  .mobile-controls {
    right: 5%;
    top: 50%;
    transform: translateY(-50%);
  }
}
```

---

# 10. Virtual joystick

Joystick gồm:

```text
JoystickBase
JoystickKnob
```

Output:

```ts
interface JoystickInput {
  x: number;
  y: number;
  magnitude: number;
}
```

Ý nghĩa:

```text
x = -1 → left
x =  1 → right

y = -1 → up
y =  1 → down

magnitude = 0 → không di chuyển
magnitude = 1 → movement tối đa
```

Knob phải được clamp trong bán kính joystick.

---

# 11. Pointer Events

Virtual joystick sử dụng:

```text
Pointer Events API
```

để hỗ trợ:

- Touch
- Mouse
- Stylus

Không cần tạo implementation riêng cho từng loại pointer nếu không cần.

Cần xử lý:

```text
pointerdown
pointermove
pointerup
pointercancel
```

---

# 12. Input abstraction

GameEngine không được biết input đến từ keyboard hay touch.

Tạo interface chung:

```ts
interface InputState {
  x: number;
  y: number;
  magnitude: number;
}
```

Luồng:

```text
Keyboard
    ↓
KeyboardController
    ↓
InputState
    ↓
GameEngine
```

và:

```text
Virtual Joystick
    ↓
TouchController
    ↓
InputState
    ↓
GameEngine
```

Cả desktop và mobile phải sử dụng cùng Movement System.

---

# 13. BOT

Mặc định:

```text
BOT_COUNT = 20
```

Tổng:

```text
1 PLAYER + 20 BOT = 21 TADPOLES
```

Không hard-code 20 trong nhiều file.

Đặt:

```ts
BOT_COUNT: 20
```

trong GameConfig.

---

# 14. BOT AI

BOT không cần AI phức tạp.

BOT cần:

1. Tự động chạy về phía finish.
2. Có random nhẹ về hướng.
3. Có tốc độ hơi khác nhau.
4. Không vượt quá giới hạn speed hợp lý.
5. Có khả năng xử lý boundary.
6. Không đứng yên hoặc bị kẹt.

Ví dụ speed variation:

```ts
const speed =
  BOT_SPEED * randomRange(0.9, 1.05);
```

BOT không nên chạy giống hệt nhau.

Mỗi BOT có thể có:

```text
speedMultiplier
lanePreference
movementNoise
```

---

# 15. Track

Track gồm:

```text
start area
race area
left boundary
right boundary
finish line
```

Đường đua nên đủ rộng để 21 tadpoles có thể cùng di chuyển.

Không nên thiết kế track quá hẹp khiến BOT liên tục kẹt.

---

# 16. Boundary

Hai bên đường có:

```text
LEFT_BOUNDARY
RIGHT_BOUNDARY
```

Khi tadpole chạm boundary:

```text
velocity *= BOUNDARY_SLOW_FACTOR
```

Ví dụ:

```ts
BOUNDARY_SLOW_FACTOR = 0.5;
```

Tức là tốc độ giảm còn khoảng 50%.

Slow effect tồn tại:

```ts
BOUNDARY_SLOW_DURATION = 500;
```

Ví dụ:

```text
Chạm vạch
    ↓
Slow 500ms
    ↓
Trở lại tốc độ bình thường
```

---

# 17. Boundary collision

Không cho nòng nọc xuyên qua boundary.

Ví dụ:

```ts
if (tadpole.x - tadpole.radius < leftBoundary) {
  tadpole.x = leftBoundary + tadpole.radius;
  applySlowEffect(tadpole);
}
```

Tương tự:

```ts
if (tadpole.x + tadpole.radius > rightBoundary) {
  tadpole.x = rightBoundary - tadpole.radius;
  applySlowEffect(tadpole);
}
```

Không teleport nòng nọc.

Không để tadpole bị kẹt bên ngoài track.

---

# 18. Finish line

Có finish line:

```text
🏁
```

Khi tadpole chạm finish:

```ts
isFinished = true;
```

Winner là tadpole đầu tiên chạm finish.

Ngay khi có winner:

```text
STOP GAME
```

Không tiếp tục update race.

Không cho nhiều winner.

---

# 19. Winner

Winner object:

```ts
interface Winner {
  tadpoleId: string;
  type: 'player' | 'bot';
  profession: Profession;
}
```

Khi game kết thúc:

1. Xác định tadpole thắng.
2. Stop game loop/update.
3. Random profession.
4. Hiển thị Winner Modal.

---

# 20. Profession

Danh sách nghề nghiệp mặc định:

```ts
const professions = [
  'Bác sĩ',
  'Kỹ sư',
  'Giáo viên',
  'Phi công',
  'Đầu bếp',
  'Luật sư',
  'Kiến trúc sư',
  'Nhà khoa học',
  'Lập trình viên',
  'Họa sĩ',
  'Nhạc sĩ',
  'Vận động viên',
  'Nhà thiết kế',
  'Nông dân',
  'Doanh nhân',
  'Nhà báo',
  'Nhiếp ảnh gia',
  'Nhà nghiên cứu',
  'Phi hành gia',
  'Nhà thám hiểm'
];
```

Random:

```ts
const profession =
  professions[
    Math.floor(Math.random() * professions.length)
  ];
```

Nên tạo helper:

```text
randomChoice(array)
```

để các logic random không nằm rải rác trong code.

---

# 21. Winner screen

Nếu BOT thắng:

```text
┌─────────────────────────────┐
│          🏆 FINISH!         │
│                             │
│      BOT #7 CHIẾN THẮNG     │
│                             │
│      Nghề nghiệp:           │
│      🚀 PHI HÀNH GIA        │
│                             │
│        [ CHƠI LẠI ]         │
└─────────────────────────────┘
```

Nếu player thắng:

```text
┌─────────────────────────────┐
│        🏆 BẠN ĐÃ THẮNG!     │
│                             │
│      Nòng nọc của bạn       │
│                             │
│      Nghề nghiệp:           │
│      👨‍💻 LẬP TRÌNH VIÊN     │
│                             │
│        [ CHƠI LẠI ]         │
└─────────────────────────────┘
```

Profession chỉ là phần random vui nhộn sau khi winner được xác định.

---

# 22. Game state

Sử dụng state machine:

```ts
type GameStatus =
  | 'idle'
  | 'countdown'
  | 'running'
  | 'paused'
  | 'finished';
```

Flow:

```text
IDLE
 ↓
START
 ↓
COUNTDOWN
 ↓
RUNNING
 ↓
ONE TADPOLE FINISH
 ↓
FINISHED
```

Pause:

```text
RUNNING
 ↓
PAUSED
 ↓
RUNNING
```

Tránh tạo quá nhiều boolean:

```text
isStarted
isRunning
isFinished
isCounting
isPaused
```

nếu có thể dùng một `GameStatus`.

---

# 23. Countdown

Trước khi race:

```text
3
2
1
GO!
```

Trong countdown:

- Không cho Player di chuyển.
- Không cho BOT di chuyển.
- Không tính finish.
- Không chạy gameplay physics.

Sau:

```text
GO!
```

game chuyển sang:

```text
running
```

---

# 24. Game loop

Dùng:

```ts
requestAnimationFrame
```

Concept:

```ts
function gameLoop(timestamp: number) {
  const deltaTime =
    timestamp - previousTimestamp;

  update(deltaTime);
  render();

  previousTimestamp = timestamp;

  animationFrameId =
    requestAnimationFrame(gameLoop);
}
```

Tách rõ:

```text
UPDATE
RENDER
```

---

# 25. Delta time

Không phụ thuộc FPS.

Không viết:

```ts
x += speed;
```

Phải dùng:

```ts
const dt = deltaTime / 1000;

x += speed * dt;
```

Game chạy ổn định hơn trên các thiết bị có FPS khác nhau.

---

# 26. GameEngine

Tạo:

```ts
class GameEngine {
  start(): void;
  pause(): void;
  resume(): void;
  stop(): void;
  reset(): void;

  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}
```

Engine quản lý:

```text
player
bots
track
finishLine
game status
winner
camera
```

---

# 27. Rendering

Tadpole được render bằng Canvas.

MVP không cần sprite phức tạp.

Có thể vẽ bằng:

```text
circle
ellipse
Bezier curve
```

Nòng nọc gồm:

```text
HEAD
+
TAIL
```

Tail có animation nhẹ để tạo cảm giác sống động.

---

# 28. Player visual

Player phải dễ nhận biết so với BOT.

Có thể sử dụng:

```text
larger size
outline
glow
distinct body shape
```

Ví dụ concept:

```text
PLAYER
    ●~~~~

BOT
    ○~~~~
```

Production không cần sử dụng emoji; nên vẽ bằng Canvas.

---

# 29. BOT visual

BOT có thể có:

- màu/skin khác nhau
- kích thước nhỏ variation
- tốc độ khác nhau nhẹ

Nhưng gameplay phải rõ ràng.

Không làm visual quá phức tạp ở MVP.

---

# 30. Camera

Nếu track dài hơn màn hình:

```text
cameraX
cameraY
```

Có thể follow player.

Concept:

```text
WORLD
────────────────────────────────────────>

               PLAYER
                 ↓
              CAMERA
          ┌─────────────┐
          │ VIEWPORT    │
          └─────────────┘
```

MVP có thể bắt đầu với camera đơn giản.

Sau đó mở rộng camera follow nếu cần.

---

# 31. Responsive Canvas

Canvas phải responsive.

Không chỉ scale bằng CSS.

Sử dụng:

```ts
window.devicePixelRatio
```

để Canvas sắc nét trên màn hình Retina/mobile.

Concept:

```ts
const dpr =
  window.devicePixelRatio || 1;

canvas.width = width * dpr;
canvas.height = height * dpr;

ctx.scale(dpr, dpr);
```

Khi resize:

```text
Canvas resize
 ↓
Update viewport
 ↓
Update camera
 ↓
Render lại
```

---

# 32. Orientation

Hỗ trợ:

```text
portrait
landscape
```

Không reload browser khi xoay điện thoại.

Game phải tự resize.

Có thể dùng:

```ts
window.matchMedia(
  '(orientation: portrait)'
);
```

hoặc kiểm tra:

```ts
window.innerWidth <
window.innerHeight
```

---

# 33. Mobile UX

Khi mobile:

```css
touch-action: none;
user-select: none;
-webkit-user-select: none;
```

Không để:

- scroll page
- accidental browser gestures
- zoom
- pull-to-refresh

làm ảnh hưởng game.

---

# 34. React responsibilities

React quản lý:

```text
Start Screen
HUD
Countdown
Winner Modal
Pause Button
Mobile Controls
Game Status
```

Canvas/GameEngine quản lý:

```text
movement
physics
collision
BOT AI
rendering
finish detection
```

Không gọi:

```text
setState()
```

mỗi animation frame.

---

# 35. Zustand

Nếu sử dụng Zustand:

```ts
interface GameStore {
  status: GameStatus;
  winner: Winner | null;

  startGame(): void;
  pauseGame(): void;
  resumeGame(): void;
  finishGame(winner: Winner): void;
  resetGame(): void;
}
```

Không lưu:

```text
player.x
player.y
bot.x
bot.y
```

trong Zustand.

Các giá trị realtime thuộc GameEngine.

---

# 36. HUD

Desktop:

```text
┌──────────────────────────────┐
│ 🏁 TADPOLE RACE      7 / 21  │
└──────────────────────────────┘
```

Có thể hiển thị:

```text
Position: 7 / 21
```

HUD không cần update React mỗi frame.

Có thể update khoảng:

```text
10–15 lần / giây
```

hoặc chỉ khi position thay đổi đáng kể.

---

# 37. Start Screen

Thiết kế đơn giản:

```text
        TADPOLE RACE

      🐸 ĐUA NÒNG NỌC 🐸

          21 NÒNG NỌC

         [ BẮT ĐẦU ]
```

Hướng dẫn:

```text
PC:
WASD / Arrow Keys

Mobile:
Use Virtual Joystick
```

---

# 38. Pause

Desktop:

```text
ESC
```

hoặc button.

Mobile có:

```text
Pause Button
```

Pause phải:

```text
stop game update
```

nhưng không destroy GameEngine.

Khi resume:

```text
continue game
```

---

# 39. Restart

Winner screen có:

```text
[ CHƠI LẠI ]
```

Restart không reload browser.

Phải reset:

```text
player
bots
positions
velocities
finish state
winner
camera
slow effects
countdown
game status
```

Flow:

```text
FINISHED
 ↓
RESTART
 ↓
RESET
 ↓
COUNTDOWN
 ↓
RUNNING
```

---

# 40. Collision

MVP cần:

```text
Tadpole vs Boundary
Tadpole vs Finish Line
Tadpole vs Tadpole
```

Tadpole vs Tadpole có thể là collision nhẹ.

Nếu va chạm:

```text
push away
```

Không cần physics engine phức tạp.

---

# 41. Spawn

Start area phải có đủ khoảng cách.

Không spawn tadpoles chồng lên nhau.

Concept:

```text
BOT   BOT   BOT   BOT   BOT

BOT   PLAYER   BOT   BOT

BOT   BOT   BOT   BOT   BOT
```

Tạo:

```ts
MIN_SPAWN_DISTANCE
```

để kiểm soát khoảng cách.

---

# 42. Random utilities

Tạo:

```ts
randomRange(min, max)
randomInt(min, max)
randomChoice(array)
```

Hạn chế gọi `Math.random()` trực tiếp ở nhiều nơi.

Điều này giúp dễ test và debug hơn.

---

# 43. Audio

Có thể dùng:

```text
Howler.js
```

Sound effects:

```text
countdown
GO
boundary hit
finish
winner
button click
```

Có:

```text
Mute / Unmute
```

Không autoplay audio trước user interaction nếu browser chặn.

---

# 44. Error handling

Nếu Canvas không được hỗ trợ:

```text
Trình duyệt của bạn không hỗ trợ Canvas.
Vui lòng sử dụng trình duyệt hiện đại.
```

Nếu orientation thay đổi:

```text
Không restart game.
Không reload trang.
Resize game tự động.
```

---

# 45. Accessibility

Button phải có:

```text
aria-label
```

Joystick:

```text
aria-label="Điều khiển di chuyển"
```

Keyboard phải hỗ trợ:

```text
W
A
S
D
ArrowUp
ArrowDown
ArrowLeft
ArrowRight
Escape
```

---

# 46. Performance

Mục tiêu:

```text
60 FPS
```

trên desktop và mobile hiện đại.

Không:

- setState mỗi frame
- tạo DOM element cho từng tadpole
- tạo object mới liên tục trong game loop nếu không cần
- dùng React state cho x/y realtime
- dùng setInterval cho game physics
- render React component mỗi frame

Ưu tiên:

```text
Canvas
+
requestAnimationFrame
+
mutable game state
```

---

# 47. Memory leak prevention

Khi GameCanvas unmount:

Phải cleanup:

```text
requestAnimationFrame
keyboard listeners
pointer listeners
resize listeners
orientation listeners
audio listeners
```

Không để game loop tiếp tục chạy sau khi component bị destroy.

---

# 48. Game configuration

Tạo:

```ts
export const GAME_CONFIG = {
  BOT_COUNT: 20,

  BOT_SPEED: 100,

  PLAYER_SPEED_MULTIPLIER: 1.2,

  BOUNDARY_SLOW_FACTOR: 0.5,

  BOUNDARY_SLOW_DURATION: 500,

  TADPOLE_RADIUS: 12,

  COUNTDOWN_SECONDS: 3,

  TARGET_FPS: 60,
};
```

Tất cả gameplay constants nên tập trung tại đây.

---

# 49. Suggested dependencies

Initial:

```bash
npm install zustand howler lucide-react
```

Không cần Matter.js ngay.

Nếu sau này physics phức tạp:

```bash
npm install matter-js
```

---

# 50. Development phases

## Phase 1 — Foundation

Implement:

- Vite
- React
- TypeScript
- Canvas
- GameEngine
- GameLoop
- resize handling

Definition of done:

```text
Canvas chạy ổn định.
requestAnimationFrame hoạt động.
Không memory leak.
```

---

## Phase 2 — Player

Implement:

- Tadpole entity
- Player
- WASD
- Arrow keys
- Movement
- Diagonal normalization

Definition of done:

```text
Có thể điều khiển player bằng keyboard.
```

---

## Phase 3 — Track

Implement:

- Track
- Left boundary
- Right boundary
- Finish line
- Boundary collision
- Slow effect

Definition of done:

```text
Player không thể xuyên boundary.
Chạm boundary → bị slow.
```

---

## Phase 4 — Bots

Implement:

- 20 BOT
- BOT movement
- Random speed
- Random movement variation
- Spawn system

Definition of done:

```text
21 tadpoles cùng chạy.
Player nhanh hơn BOT 1.2 lần theo base speed.
```

---

## Phase 5 — Winner

Implement:

- Finish detection
- Winner system
- Random profession
- Winner modal
- Restart

Definition of done:

```text
Tadpole đầu tiên cán finish là winner.
Game dừng ngay sau khi xác định winner.
```

---

## Phase 6 — Mobile

Implement:

- Virtual joystick
- Pointer Events
- Portrait layout
- Landscape layout
- Responsive controls
- Touch prevention

Definition of done:

```text
Mobile portrait chơi được.
Mobile landscape chơi được.
```

---

## Phase 7 — Polish

Implement:

- Countdown animation
- Tadpole tail animation
- Better visuals
- Boundary hit effect
- Finish effect
- Particle effects
- Sound
- HUD
- Pause
- Restart animation

Chỉ polish sau khi gameplay MVP hoàn chỉnh.

---

# 51. Future features

Không implement trong MVP.

Architecture nên dễ mở rộng cho:

```text
Power-ups
Boost
Shield
Slow trap
Speed trap
Different tadpole skins
Character customization
Leaderboard
Multiple tracks
Different environments
Weather
Online multiplayer
Music
Mobile vibration
Achievements
Coins
Shop
```

Không tự ý implement các feature trên trước MVP.

---

# 52. Coding rules cho AI coding agent

AI coding agent PHẢI:

1. Đọc toàn bộ file specification trước khi code.
2. Không code toàn bộ game vào một file.
3. Chia code theo architecture.
4. Bắt đầu từng phase một.
5. Sau mỗi phase phải đảm bảo project vẫn chạy.
6. Không dùng `any` nếu không cần thiết.
7. Dùng TypeScript type rõ ràng.
8. Không dùng React state cho realtime game physics.
9. Không dùng DOM animation cho tadpoles.
10. Không dùng `setInterval` cho game loop.
11. Dùng `requestAnimationFrame`.
12. Dùng delta time.
13. Normalize diagonal movement.
14. Player base speed = BOT speed × 1.2.
15. Có đúng 20 BOT mặc định.
16. Boundary phải collision.
17. Boundary phải gây slow effect.
18. Finish phải xác định đúng winner đầu tiên.
19. Khi winner được xác định phải stop race.
20. Profession được random sau khi xác định winner.
21. Keyboard và Touch phải sử dụng cùng InputState.
22. Mobile joystick phải dùng Pointer Events.
23. Portrait joystick nằm giữa phía dưới.
24. Landscape joystick nằm bên phải.
25. Không hard-code vị trí joystick bằng JS.
26. Canvas sử dụng devicePixelRatio.
27. Canvas responsive.
28. Không reload khi orientation thay đổi.
29. Cleanup toàn bộ event listeners.
30. Cleanup requestAnimationFrame.
31. Không tạo memory leak.
32. Không tự ý thêm dependency nếu không cần.
33. Không thêm Matter.js nếu collision MVP có thể tự xử lý.
34. Không thêm feature ngoài specification trước khi MVP hoàn thành.
35. Không thay đổi gameplay requirement nếu chưa có lý do kỹ thuật rõ ràng.

---

# 53. Testing checklist

## Desktop

- [ ] Start game
- [ ] Countdown
- [ ] W di chuyển lên
- [ ] A di chuyển trái
- [ ] S di chuyển xuống
- [ ] D di chuyển phải
- [ ] Arrow keys hoạt động
- [ ] Diagonal movement hoạt động
- [ ] Diagonal không nhanh hơn bình thường
- [ ] Player nhanh hơn BOT 1.2 lần
- [ ] 20 BOT xuất hiện
- [ ] Boundary collision hoạt động
- [ ] Boundary slow hoạt động
- [ ] Finish detection hoạt động
- [ ] Winner được xác định
- [ ] Profession random
- [ ] Game stop sau winner
- [ ] Restart hoạt động
- [ ] Pause hoạt động
- [ ] ESC hoạt động

## Mobile Portrait

- [ ] Canvas responsive
- [ ] Joystick xuất hiện
- [ ] Joystick ở giữa phía dưới
- [ ] Drag joystick hoạt động
- [ ] Player di chuyển đúng hướng
- [ ] Boundary hoạt động
- [ ] Finish hoạt động
- [ ] Winner screen hoạt động
- [ ] Không scroll page
- [ ] Không accidental zoom

## Mobile Landscape

- [ ] Canvas responsive
- [ ] Joystick xuất hiện bên phải
- [ ] Joystick không che gameplay quan trọng
- [ ] Drag joystick hoạt động
- [ ] Player di chuyển đúng hướng
- [ ] Boundary hoạt động
- [ ] Finish hoạt động
- [ ] Winner screen hoạt động
- [ ] Xoay orientation không reload

## Performance

- [ ] Target 60 FPS
- [ ] Không React re-render mỗi frame
- [ ] Không memory leak
- [ ] Không animation bằng setInterval
- [ ] requestAnimationFrame cleanup
- [ ] Resize cleanup
- [ ] Keyboard listener cleanup
- [ ] Pointer listener cleanup

---

# 54. MVP Definition of Done

MVP hoàn thành khi người chơi có thể:

### Desktop

```text
Start
 ↓
Countdown
 ↓
Điều khiển bằng WASD / Arrow
 ↓
Đua với 20 BOT
 ↓
Chạm boundary → slow
 ↓
Cán finish
 ↓
Winner
 ↓
Random profession
 ↓
Restart
```

### Mobile

```text
Start
 ↓
Countdown
 ↓
Điều khiển bằng virtual joystick
 ↓
Portrait / Landscape
 ↓
Đua với 20 BOT
 ↓
Boundary slow
 ↓
Finish
 ↓
Winner
 ↓
Random profession
 ↓
Restart
```

---

# 55. Recommended implementation order

AI coding agent nên triển khai chính xác theo thứ tự:

```text
1. Project setup
        ↓
2. Canvas
        ↓
3. GameEngine
        ↓
4. GameLoop
        ↓
5. Player
        ↓
6. Keyboard input
        ↓
7. Track
        ↓
8. Boundary collision
        ↓
9. Boundary slow
        ↓
10. Finish line
        ↓
11. 20 BOT
        ↓
12. BOT AI
        ↓
13. Winner
        ↓
14. Random profession
        ↓
15. Winner UI
        ↓
16. Restart
        ↓
17. Mobile joystick
        ↓
18. Portrait
        ↓
19. Landscape
        ↓
20. Responsive Canvas
        ↓
21. Pause
        ↓
22. Audio
        ↓
23. Visual polish
        ↓
24. Testing
```

---

# 56. Final instruction to AI

Hãy coi file này là **Product Requirements + Technical Specification** của game.

Không được tự ý thay đổi gameplay cốt lõi.

Nếu có vấn đề kỹ thuật:

1. Ưu tiên giải pháp đơn giản.
2. Ưu tiên performance.
3. Ưu tiên maintainability.
4. Ưu tiên mobile compatibility.
5. Không thêm dependency không cần thiết.
6. Không over-engineering.
7. Không implement feature tương lai trước MVP.

Ưu tiên:

```text
Gameplay correctness
        >
Performance
        >
Responsive controls
        >
Clean architecture
        >
Visual polish
```

Mục tiêu cuối cùng:

> Một game đua nòng nọc 2D nhẹ, vui, responsive, chơi tốt bằng bàn phím trên web và virtual joystick trên điện thoại.
