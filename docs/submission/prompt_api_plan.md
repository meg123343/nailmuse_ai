# Prompt 与接口实现方案

## 1. 生图 Prompt 方向

### La La Land 样例 Prompt

生成一套横屏 16:9 美甲设计展示图，灵感来自电影《La La Land》的夜空海报，但不要出现电影标题、文字、演员脸、人物肖像或可识别版权标志。画面中心展示 10 个独立甲片，分为两行，每行 5 个，上排标记 RIGHT HAND 五片，下排标记 LEFT HAND 五片。甲片形状统一为短款椭圆方圆之间，边缘圆润，适合日常美甲制作。整体风格为半插画半真实美甲产品展示，hand-drawn pop poster style + semi-real gel nail material。甲片背景使用透明或纯浅色背景，方便抠图后放入网页。颜色来自夜空深蓝 #08114A、紫色渐变 #4B24B8、聚光灯黄 #FFD84D、暖奶油白 #FFF2C6、城市黑 #17151E。材质包含亮面凝胶、冰透紫色渐变、细闪星点、局部磁吸光带，但这里的 cat-eye 表示美甲磁吸光，不是动物眼睛。图案元素包括星空点点、聚光灯光晕、黄色裙摆弧线、城市天际线剪影、音乐节奏线。图案要简洁可做，2-3 个主视觉甲，其余为纯色、渐变、低难度点缀。不要文字，不要真实手部，不要复杂背景，不要多余甲片。

### 单甲生成模板

```text
A single {shape} press-on nail tip, transparent background, {finish} gel nail material, {base_color} base, {pattern}, inspired by {theme}, daily wearable nail art, product mockup, clean edge, soft highlight, no text, no logo, no human face, no realistic hand, no extra nails.
```

### 负面 Prompt

```text
text, letters, movie title, logo, watermark, human face, actor portrait, realistic hand, fingers, extra nails, animal eye, real cat eye, cluttered background, too many tiny details, unreadable micro painting, distorted nail, inconsistent nail count, low resolution, messy crop
```

## 2. 推荐接口流程

### Step 1：素材分析

```http
POST /api/analyze
Content-Type: multipart/form-data
```

输入：用户图片、视频截图或链接截图。  
输出：主题、色卡、视觉元素、文字识别结果、禁止转译项。

### Step 2：美甲方案规划

```http
POST /api/plan
Content-Type: application/json
```

输入：素材分析结果 + 用户标签。  
输出：10 个固定槽位 JSON。

### Step 3：单甲生成

```http
POST /api/generate
Content-Type: application/json
```

输入：每个 slot 的 Prompt、negative_prompt、seed、style_id。  
输出：透明背景甲片 PNG URL。

### Step 4：局部重生

```http
POST /api/regenerate
Content-Type: application/json
```

输入：锁定槽位和需要重生槽位。  
输出：只替换未锁定槽位的新图片 URL。

## 3. 关键 JSON 示例

```json
{
  "project_id": "demo_lalaland_001",
  "style_id": "style_lalaland_night_v1",
  "constraints": {
    "length": "short",
    "shape": "oval",
    "finish": "glossy",
    "difficulty": "daily wearable"
  },
  "palette": [
    {"hex": "#08114A", "role": "base"},
    {"hex": "#4B24B8", "role": "gradient"},
    {"hex": "#FFD84D", "role": "accent"},
    {"hex": "#FFF2C6", "role": "neutral"}
  ],
  "slots": [
    {
      "slot_id": "R1",
      "role": "hero",
      "prompt_atoms": ["midnight navy base", "diagonal galaxy shimmer", "glossy gel"],
      "locked": false,
      "seed": 11001
    }
  ],
  "avoid": ["text", "face", "logo", "real cat eye", "complex background"]
}
```

## 4. 稳定性原则

- 不依赖单条 Prompt 控制全部结果。
- 先 JSON，再 Prompt，再生图。
- 不让图像模型决定页面排版。
- 10 个槽位由前端固定渲染。
- 喜欢的槽位通过 `locked: true` 保留。
- 局部重生时只请求未锁定槽位。
- 使用 seed、style_id、palette 和 negative_prompt 保持一致性。
