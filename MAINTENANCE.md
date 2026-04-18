# 博客网站维护手册

## 1. 主题管理

### 1.1 定期更新PaperMod主题

PaperMod主题使用git submodule形式管理，建议定期更新以获取最新功能和bug修复：

```bash
# 更新主题
git submodule update --remote

# 提交更新
git add themes/PaperMod
git commit -m "Update PaperMod theme"
git push origin main
```

### 1.2 主题配置

主题配置位于 `hugo.toml` 文件中，主要配置项包括：

- `theme = "PaperMod"` - 启用PaperMod主题
- `defaultTheme = "auto"` - 自动切换明暗主题
- `ShowReadingTime = true` - 显示阅读时间
- `ShowShareButtons = true` - 显示分享按钮
- `ShowPostNavLinks = true` - 显示文章导航链接
- `ShowBreadCrumbs = true` - 显示面包屑导航
- `ShowCodeCopyButtons = true` - 显示代码复制按钮

## 2. 内容管理

### 2.1 创建新文章

使用Hugo命令创建新文章：

```bash
# 创建新文章
hugo new posts/文章标题.md

# 创建新的系列文章
hugo new series/系列名称/文章标题.md
```

### 2.2 文章Front Matter配置

文章文件开头的Front Matter配置示例：

```yaml
title: "文章标题"
date: 2026-04-18T10:00:00+08:00
draft: false
description: "文章描述"
tags: ["标签1", "标签2"]
categories: ["分类"]
summary: "文章摘要"
```

### 2.3 图片管理

图片文件应放置在 `static/images/` 目录下，在文章中引用：

```markdown
![图片描述](/images/图片文件名.png)
```

## 3. 网站配置

### 3.1 基本配置

`hugo.toml` 文件中的基本配置：

- `baseURL` - 网站基础URL
- `languageCode` - 网站语言代码
- `title` - 网站标题
- `paginate` - 每页显示的文章数量

### 3.2 菜单配置

菜单配置位于 `[menu.main]` 部分，可以添加或修改菜单项：

```toml
[[menu.main]]
    identifier = "posts"
    name = "文章"
    url = "/posts/"
    weight = 10
```

### 3.3 SEO配置

SEO相关配置位于 `[params.seo]` 部分：

```toml
[params.seo]
    googleSiteVerification = ""  # 谷歌站点验证
    bingSiteVerification = ""    # 必应站点验证
    yandexSiteVerification = ""  # 雅虎站点验证
```

## 4. 部署管理

### 4.1 本地预览

使用Hugo服务器本地预览网站：

```bash
# 启动本地服务器（包含草稿）
hugo server -D

# 启动本地服务器（生产模式）
hugo server -e production
```

### 4.2 构建部署

构建网站并部署到GitHub Pages：

```bash
# 构建网站
hugo --minify

# 推送更改到GitHub（自动触发Actions部署）
git add .
git commit -m "更新内容"
git push origin main
```

### 4.3 GitHub Actions配置

部署配置位于 `.github/workflows/deploy.yml` 文件，主要流程：

1. 检查代码仓库（包括submodules）
2. 设置Hugo环境
3. 缓存Hugo模块
4. 构建网站
5. 部署到GitHub Pages

## 5. 性能优化

### 5.1 图片优化

图片处理配置位于 `[imaging]` 部分：

```toml
[imaging]
  quality = 85  # 图片质量
  format = "webp"  # 图片格式
  [imaging.thumbnail]
    width = 120
    height = 120
    cropping = "smart"
  resampleFilter = "Lanczos3"
```

### 5.2 缓存策略

GitHub Actions配置中已添加缓存机制，提高构建速度：

```yaml
- name: Cache Hugo modules
  uses: actions/cache@v4
  with:
    path: ~/.cache/hugo
    key: ${{ runner.os }}-hugo-${{ hashFiles('**/go.sum') }}
    restore-keys: |
      ${{ runner.os }}-hugo-
```

## 6. 备份策略

### 6.1 代码备份

使用Git版本控制进行代码备份：

```bash
# 提交更改
git add .
git commit -m "备份：日期"
git push origin main
```

### 6.2 内容备份

定期导出内容为Markdown文件，保存到本地或云存储。

## 7. 常见问题排查

### 7.1 主题更新问题

如果主题更新后出现问题：

```bash
# 回滚到之前的版本
git submodule update --init
git checkout <commit-hash>
```

### 7.2 构建失败

检查以下可能的原因：

- 语法错误：检查Markdown文件语法
- 路径问题：确保文件路径正确
- 依赖问题：确保所有依赖项已正确安装

### 7.3 部署失败

检查GitHub Actions日志，常见问题：

- 权限问题：确保GitHub Actions有正确的权限
- 构建错误：检查构建过程中的错误信息
- 网络问题：如果是网络问题，重试部署

## 8. 安全维护

### 8.1 依赖更新

定期更新Hugo版本和依赖项：

```bash
# 更新Hugo
# 根据操作系统使用相应的包管理器更新

# 更新主题
git submodule update --remote
```

### 8.2 配置安全

- 不要在配置文件中存储敏感信息
- 使用环境变量存储敏感配置
- 定期检查配置文件的安全性

## 9. 维护计划

### 每周维护

- 检查并更新主题
- 发布新内容
- 备份网站数据

### 每月维护

- 检查网站性能
- 优化图片和资源
- 清理无用文件

### 季度维护

- 全面检查网站功能
- 更新Hugo版本
- 优化网站结构

## 10. 联系信息

- 网站管理员：zhsusn
- 技术支持：通过GitHub Issues提交问题
- 文档更新：如有文档更新需求，请提交Pull Request

---

本维护手册将根据网站发展和技术变化定期更新。