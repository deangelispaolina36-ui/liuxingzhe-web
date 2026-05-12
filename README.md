# 鎏行者 · 丝路旅程生成器

> 西夏文物数字化文创开发 · 毕业设计网页 Demo
> © 2026 王泰然 · 宁夏大学新闻传播学院广告学

## 快速开始

1. **填写 API Key**（必须）
   打开 `app.js`，在文件顶部 `CONFIG.DEEPSEEK_API_KEY` 处填入你的 DeepSeek API Key。
   - 获取地址：https://platform.deepseek.com
   - 未填写时，页面会自动使用本地演示数据，仍然可以完整体验交互流程。

2. **放置图片**
   将以下文件放到 `assets/images/` 目录，文件不存在时会显示文字占位，不会报错：
   | 文件名 | 用途 |
   |---|---|
   | `hero-character.png` | 首屏鎏行者立绘 |
   | `character-intro.png` | IP 介绍板块角色图 |
   | `relic-bull.png` | 鎏金铜牛文物照片 |
   | `product-liuxiaoshou.png` | 鎏小守疗愈玩偶 |
   | `product-liuxingzhe.png` | 鎏行者收藏手办 |
   | `product-keychain1.png` | 本体挂件 |
   | `product-keychain2.png` | 丝路组合挂件 |

3. **运行**
   直接双击 `index.html` 即可在浏览器中打开；推荐使用 Chrome / Edge / Safari。

## 目录结构

```
liuxingzhe-web/
├── index.html      主页面
├── styles.css      全部样式
├── app.js          交互与 API 集成
├── assets/
│   └── images/     图片资源
└── README.md
```

## 技术说明

- 纯 HTML + CSS + JavaScript，无构建依赖
- DeepSeek API (OpenAI 兼容) 生成旅程文案
- 适配 PC / 移动端
- 西夏几何纹样全部用 SVG / CSS 实现，无需额外图片

## 配色

| | HEX |
|---|---|
| 孔雀绿 | `#2D7D6F` |
| 沙色 | `#C8A96E` |
| 陶土红 | `#C4622D` |
| 鎏金 | `#D4AF37` |
| 深底 | `#1A1208` |
| 文字浅色 | `#F5EDD6` |

## 安全提醒

**不要把 API Key 提交到 Git 仓库或发送到聊天对话中。**
建议在生产环境改为通过后端代理调用，避免 Key 暴露在前端。
