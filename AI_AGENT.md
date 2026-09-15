# AI_AGENT.md

# 🎮 LIFE GAME — AI DESIGN & DEVELOPMENT GUIDELINES

## 1. Project Overview

Đây là một game vui vẻ về **cuộc đời của tôi**.

Game mô phỏng hành trình cuộc sống dưới dạng một trò chơi tương tác:
- Người chơi trải qua các giai đoạn khác nhau trong cuộc đời.
- Người chơi đưa ra các lựa chọn.
- Mỗi lựa chọn có thể tạo ra tình huống, phần thưởng hoặc hệ quả khác nhau.
- Có thể có các chỉ số như tiền, năng lượng, hạnh phúc, tình bạn, tình yêu, sự nghiệp, may mắn...
- Gameplay mang tính giải trí, vui vẻ, hài hước và có tính cá nhân.
- UI mang cảm giác của một game hiện đại, casual và thân thiện.

> **Đây không phải dashboard quản trị. Đây là một trò chơi kể về cuộc đời.**

---

# 2. Core Principle

## ⚠️ DESIGN SYSTEM LÀ LUẬT CHUNG

Khi thiết kế UI hoặc generate code:

> **KHÔNG ĐƯỢC TỰ Ý THAY ĐỔI DESIGN SYSTEM.**

AI phải:
1. Kiểm tra Design Tokens trước khi tạo UI.
2. Tái sử dụng component hiện có.
3. Chỉ tạo biến thể mới khi thực sự cần thiết.
4. Không tự tạo màu mới nếu chưa được định nghĩa.
5. Không thay đổi radius, shadow, typography hoặc spacing một cách tùy tiện.
6. Nếu đã có component tương ứng thì ưu tiên sử dụng component đó.

---

# 3. Design Direction

Phong cách tổng thể:
- 🎮 Modern Game UI
- 😄 Fun
- 🧸 Friendly
- ✨ Playful
- 🌈 Colorful nhưng có kiểm soát
- 🧼 Clean
- 📱 Responsive
- 🎨 Có tính cá nhân
- 🪄 Casual / cartoon-inspired

### Tránh
- UI enterprise quá nghiêm túc.
- UI giống dashboard quản trị.
- Quá nhiều gradient.
- Quá nhiều màu trên cùng một màn hình.
- Neon quá mạnh.
- Glassmorphism quá mức.
- Typography khó đọc.
- Decoration làm ảnh hưởng gameplay.

---

# 4. Color System

## Primary
`#6C5CE7`

Dùng cho:
- Primary Button
- Active State
- Selected State
- Important Action
- Progress
- Highlight
- Interactive Elements

## Secondary
`#FFB84D`

Dùng cho:
- Coin
- Reward
- Achievement
- Energy
- Positive Highlight

## Accent
`#FF6B81`

Dùng cho:
- Heart
- Love
- Emotional State
- Special Event
- Fun Interaction

## Semantic
```text
Success: #4CD97B
Warning: #FFC857
Error:   #FF5C5C
```

## Background
```text
Background:           #FFF9F2
Background Secondary: #F5F0FF
Card:                 #FFFFFF
```

## Text
```text
Text Primary:   #29243D
Text Secondary: #716C82
Text Disabled:  #AAA6B5
```

## Border
`#DDD8E8`

---

# 5. Design Tokens

AI nên sử dụng CSS variables thay vì hard-code màu ở nhiều nơi.

```css
:root {
  --color-primary: #6C5CE7;
  --color-secondary: #FFB84D;
  --color-accent: #FF6B81;

  --color-success: #4CD97B;
  --color-warning: #FFC857;
  --color-error: #FF5C5C;

  --color-background: #FFF9F2;
  --color-background-secondary: #F5F0FF;
  --color-card: #FFFFFF;

  --color-text-primary: #29243D;
  --color-text-secondary: #716C82;
  --color-text-disabled: #AAA6B5;

  --color-border: #DDD8E8;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 24px;

  --shadow-sm: 0 2px 8px rgba(41, 36, 61, 0.08);
  --shadow-md: 0 6px 20px rgba(41, 36, 61, 0.12);

  /* Typography */
  --font-game: 'Plus Jakarta Sans', sans-serif;
  --font-ui: 'Plus Jakarta Sans', 'Inter', sans-serif;
  --font-size-base: 14px; /* Text thông thường mặc định là 14px */
}
```

## Quy tắc Typography:
- **Font tiêu đề / Nút / Badge / UI Game**: `Plus Jakarta Sans` & `Inter` (hiện đại, sắc nét, hỗ trợ tiếng Việt chuẩn).
- **Text thông thường (Body text, Label, Mô tả, Lựa chọn)**: Luôn sử dụng cỡ chữ **`14px`**.


---

# 6. Component Rules

## Button

### Primary
```text
Background: Primary
Text: White
```

Phải có:
- Rounded
- Hover
- Active
- Disabled
- Visual feedback

### Secondary
```text
Background: Secondary
Text: Text Primary
```

### Danger
```text
Background: Error
Text: White
```

Không sử dụng màu random cho button.

## Input

### Normal
```text
Background: #FFFFFF
Border: #DDD8E8
Text: #29243D
```

### Focus
```text
Border: #6C5CE7
```

### Error
```text
Border: #FF5C5C
```

Input phải:
- Dễ đọc.
- Border nhẹ.
- Focus rõ ràng.
- Rounded.
- Có label hoặc placeholder phù hợp.

Không tự ý dùng màu khác nếu chưa có trong Design System.

## Card

```text
Background: #FFFFFF
Border: #DDD8E8
Border Radius: 18px
Shadow: shadow-sm
```

Không dùng border đen mặc định.

## Modal

- White background.
- Rounded lớn.
- Shadow rõ.
- Overlay nhẹ.
- Header rõ ràng.
- Action nằm phía dưới.
- Không chiếm toàn bộ màn hình nếu không cần.

---

# 7. Game UI

Ưu tiên:

```text
Gameplay
   ↓
Feedback
   ↓
Information
   ↓
Visual
   ↓
Decoration
```

Decoration không được che hoặc làm giảm khả năng chơi game.

---

# 8. HUD

Có thể sử dụng:
```text
❤️ Life
💰 Money
⭐ XP
⚡ Energy
🎯 Score
🍀 Luck
```

Không đưa tất cả chỉ số lên màn hình nếu không cần thiết.

HUD phải:
- Dễ nhìn.
- Có hierarchy rõ ràng.
- Không che gameplay.
- Có feedback khi giá trị thay đổi.

---

# 9. Life Game Concept

Có thể chia game thành các chapter:

```text
👶 Childhood
      ↓
🎒 School
      ↓
🎓 University
      ↓
💼 First Job
      ↓
🚀 Career
      ↓
❤️ Relationships
      ↓
🏠 Life
      ↓
🌟 Future
```

Mỗi chapter có thể bao gồm:
- Story
- Choice
- Random Event
- Reward
- Consequence
- Achievement

Nội dung cần giữ tinh thần vui vẻ và cá nhân.

---

# 10. Choice System

Các lựa chọn nên gần gũi, vui vẻ và đôi khi hài hước.

Ví dụ:

```text
Bạn nhận được lời mời đi chơi.

A. Đi chơi 🎉
B. Ở nhà ngủ 😴
C. Làm việc 💻
```

Lựa chọn có thể ảnh hưởng:
```text
Money
Energy
Happiness
Relationship
Career
Luck
```

Không cần lựa chọn nào cũng nghiêm túc.

---

# 11. Visual Language

Có thể sử dụng:
- Emoji
- Icon
- Illustration
- Character
- Small Animation
- Particle
- Confetti
- Floating Numbers
- Progress Bar
- Badge
- Achievement

Các yếu tố phải thống nhất với Design System.

Không thêm decoration chỉ để làm màn hình nhiều thứ hơn.

---

# 12. Animation

Animation cần:
- Nhanh.
- Vui.
- Có feedback.
- Không gây khó chịu.

Interaction nhỏ ưu tiên:
`100ms - 200ms`

Có thể sử dụng:
- Scale
- Fade
- Slide
- Bounce nhẹ
- Floating
- Confetti

Không animation mọi component nếu không cần.

---

# 13. Responsive

Game phải hoạt động tốt trên:
```text
Desktop
Tablet
Mobile
```

Ưu tiên trải nghiệm gameplay trên mobile.

Không hard-code kích thước khiến UI bị vỡ.

---

# 14. React Technology Stack

```text
React
TypeScript
Vite
```

Game 3D:
```text
Three.js
React Three Fiber
Drei
```

State:
```text
Zustand
```

Styling:
```text
Tailwind CSS
```

---

# 15. React Architecture

Ưu tiên tách:

```text
UI
 ↓
Game Logic
 ↓
State
 ↓
Data
```

Không đưa toàn bộ game logic vào một React component lớn.

---

# 16. Folder Structure

```text
src/
├── components/
│   ├── ui/
│   ├── game/
│   └── layout/
│
├── game/
│   ├── player/
│   ├── world/
│   ├── obstacles/
│   ├── items/
│   └── systems/
│
├── stores/
├── hooks/
├── pages/
├── assets/
├── styles/
└── App.tsx
```

Có thể điều chỉnh structure khi project phát triển nhưng phải giữ separation of concerns.

---

# 17. AI Code Generation Rules

## ALWAYS
- Sử dụng TypeScript.
- Tạo component nhỏ và reusable.
- Tách game logic khỏi UI.
- Tách state khỏi component khi state được dùng ở nhiều nơi.
- Sử dụng Design Tokens.
- Responsive.
- Có interaction feedback.
- Giữ code clean.
- Ưu tiên component đã tồn tại.
- Tái sử dụng logic thay vì duplicate code.

## NEVER
- Tự tạo màu random.
- Hard-code cùng một màu ở nhiều nơi.
- Duplicate component.
- Inline style quá nhiều.
- Hard-code kích thước không cần thiết.
- Tự thay đổi Design System.
- Tạo UI enterprise nếu không được yêu cầu.
- Thêm quá nhiều decoration.
- Đưa toàn bộ logic game vào một component.

---

# 18. When Designing a New Screen

AI phải suy nghĩ theo thứ tự:

```text
1. User cần làm gì?
        ↓
2. Gameplay / Interaction chính là gì?
        ↓
3. Layout
        ↓
4. Component
        ↓
5. Design Tokens
        ↓
6. Animation
        ↓
7. Responsive
```

Không bắt đầu bằng việc chọn màu ngẫu nhiên.

---

# 19. UI Hierarchy

Mọi màn hình nên có hierarchy:

```text
PRIMARY ACTION
      ↓
IMPORTANT INFORMATION
      ↓
SECONDARY ACTION
      ↓
DECORATION
```

Primary Action phải dễ nhận biết nhất.

---

# 20. Design Consistency

Nếu một Button sử dụng:
`#6C5CE7`

thì các Button cùng loại phải sử dụng cùng màu.

Không tự ý biến thành:
```text
#4F46E5
#7C3AED
#8B5CF6
```

chỉ vì AI thấy đẹp hơn.

Tương tự với:
- Input
- Card
- Modal
- Badge
- Progress
- Navigation
- HUD
- Popup

---

# 21. Game Personality

Game phải mang cảm giác:

```text
😄 Vui
   ↓
🎮 Muốn chơi
   ↓
✨ Muốn khám phá
   ↓
😂 Có tình huống bất ngờ
   ↓
❤️ Có cảm giác cá nhân
```

Có thể đưa các tình huống đời thường, lựa chọn bất ngờ và khoảnh khắc hài hước vào game.

---

# 22. AI Generation Checklist

Trước khi generate UI/code, AI phải tự kiểm tra:

- [ ] Đúng Primary Color?
- [ ] Button đúng màu?
- [ ] Input đúng border/focus?
- [ ] Card đúng radius?
- [ ] Background đúng?
- [ ] Typography nhất quán?
- [ ] Không có màu random?
- [ ] Không duplicate component?
- [ ] Responsive?
- [ ] Có interaction feedback?
- [ ] UI mang cảm giác fun/game?
- [ ] Gameplay vẫn là trọng tâm?
- [ ] Có sử dụng component/token đã tồn tại?

---

# 23. Final Design Philosophy

> **"Đây không phải dashboard quản trị. Đây là một trò chơi kể về cuộc đời."**

Mọi thiết kế và code được AI generate phải giữ được:

```text
FUN
+
PERSONAL
+
CLEAN
+
CONSISTENT
```

**Không đánh đổi tính nhất quán của Design System chỉ để làm một màn hình trông đẹp hơn.**
