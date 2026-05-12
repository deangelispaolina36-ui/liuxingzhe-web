# 鎏途 LIUTU · 西夏文化数字 IP 网站

西夏文物数字化文创开发毕业设计网页。项目为纯静态站点，无构建依赖。

## 当前文件说明

| 文件 | 说明 |
| --- | --- |
| `index_new.html` | 开发版本，日常修改这个文件 |
| `index.html` | 线上入口，部署前由 `index_new.html` 同步而来 |
| `deploy.ps1` | 自动同步、提交、推送脚本 |
| `assets/images/` | 页面图片资源 |
| `app.js` / `styles.css` | 旧版备用文件，当前页面没有引用 |

## 本地预览

在项目目录执行：

```powershell
python -m http.server 8899
```

浏览器打开：

```text
http://127.0.0.1:8899/index_new.html
```

## 修改流程

1. 修改 `index_new.html`
2. 确认页面效果
3. 同步到 `index.html`
4. 提交并推送到 GitHub
5. EdgeOne Pages 自动部署

## 自动部署脚本

在有网络、且 GitHub 已登录或已配置凭据的电脑上执行：

```powershell
.\deploy.ps1 -Message "优化AI旅程生成内容"
```

脚本会自动：

- 创建或复用旁边的 `liuxingzhe-web-deploy` Git 仓库目录
- 克隆 `deangelispaolina36-ui/liuxingzhe-web`
- 将当前目录文件同步过去
- 将 `index_new.html` 覆盖到 `index.html`
- `git add`、`git commit`、`git push`

推送后 EdgeOne Pages 通常 1-2 分钟自动生效。

## AI 生成说明

DeepSeek 调用逻辑目前内嵌在 `index_new.html` 的底部脚本中。当前配置要求生成：

- 500-700 字旅程正文
- 2-3 个自然段
- 150-220 字文化彩蛋
- 至少包含城市、人物、货物、气候或地貌细节
- 以「鎏光」第一视角带着用户一起走丝路
- 生成结果后支持继续向鎏光提问，形成多轮对话

当前叙事关系：

- `鎏光`：情绪陪伴 IP，奶白米金、可爱、疗愈、守护，负责陪用户进入故事。
- `鎏途`：文化叙事 IP，孔雀绿、沙色、陶土红、头巾、卷轴、行囊，负责承载丝路世界观。
- `网页`：实体手办/挂件扫码后的数字延伸，让文创产品从一次性购买变成持续参与。

如 API 调用失败，页面会自动使用本地演示数据，保证答辩展示流程不断。
