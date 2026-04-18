# ============================================
# Phase 4: 系列电子书导出脚本
# 前置要求：安装 pandoc 和 texlive
# choco install pandoc
# choco install miktex
# ============================================

param(
    [Parameter(Mandatory=$true)]
    [string]$SeriesName,
    
    [string]$OutputDir = "./static/downloads",
    [string]$Format = "pdf"  # pdf | epub | markdown
)

$ErrorActionPreference = "Stop"

# 检查 pandoc
try {
    $pandocVersion = pandoc --version | Select-Object -First 1
    Write-Host "✓ 检测到 $pandocVersion" -ForegroundColor Green
} catch {
    Write-Error "请先安装 Pandoc: choco install pandoc"
    exit 1
}

# 收集系列文章
$seriesPath = "content/series/$SeriesName"
if (-not (Test-Path $seriesPath)) {
    Write-Error "系列不存在: $seriesPath"
    exit 1
}

$chapters = Get-ChildItem -Path $seriesPath -Recurse -Filter "*.md" | 
    Where-Object { $_.BaseName -ne "_index" } |
    Sort-Object { 
        # 按 chapter 数字排序
        $content = Get-Content $_.FullName -Raw
        if ($content -match 'chapter:\s*(\d+)') {
            return [int]$matches[1]
        }
        return 999
    }

Write-Host "发现 $($chapters.Count) 个章节" -ForegroundColor Cyan

# 创建临时合并文件
$tempFile = "$env:TEMP\$SeriesName-$(Get-Date -Format 'yyyyMMdd').md"
$metaFile = "$env:TEMP\$SeriesName-meta.yaml"

# 提取系列元数据
$indexFile = "$seriesPath/_index.md"
$seriesTitle = "技术系列"
$seriesDesc = ""
if (Test-Path $indexFile) {
    $indexContent = Get-Content $indexFile -Raw
    if ($indexContent -match 'title:\s*"([^"]+)"') {
        $seriesTitle = $matches[1]
    }
    if ($indexContent -match 'description:\s*"([^"]+)"') {
        $seriesDesc = $matches[1]
    }
}

# 生成 YAML 元数据
@"
---
title: "$seriesTitle"
subtitle: "$seriesDesc"
author: "zhsusn"
date: "$(Get-Date -Format 'yyyy年M月d日')"
lang: zh-CN
documentclass: book
papersize: a4
geometry: margin=2.5cm
fontsize: 11pt
linestretch: 1.8
mainfont: "Noto Serif CJK SC"
monofont: "JetBrains Mono"
colorlinks: true
linkcolor: blue
toc: true
toc-depth: 2
numbersections: true
---

"@ | Out-File -FilePath $tempFile -Encoding UTF8

# 合并所有章节（清洗 Hugo Front Matter）
foreach ($chapter in $chapters) {
    $content = Get-Content $chapter.FullName -Raw
    
    # 移除 Front Matter
    if ($content -match '^---\s*\n(.*?)\n---\s*\n(.*)$' -and $matches[2]) {
        $body = $matches[2]
    } else {
        $body = $content
    }
    
    # 提取章节标题
    $chapterNum = 1
    if ($content -match 'chapter:\s*(\d+)') {
        $chapterNum = $matches[1]
    }
    $chapterTitle = $chapter.BaseName -replace '^ch-\d+-', ''
    
    # 添加章节分隔
    "`n`n\\newpage`n`n# 第 $chapterNum 章 $chapterTitle`n`n" | Out-File -FilePath $tempFile -Append -Encoding UTF8
    $body | Out-File -FilePath $tempFile -Append -Encoding UTF8
}

Write-Host "临时文件: $tempFile" -ForegroundColor Gray

# 确保输出目录存在
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

# 导出
$outputFile = "$OutputDir/$SeriesName-$(Get-Date -Format 'yyyyMMdd').$Format"

if ($Format -eq "pdf") {
    pandoc $tempFile `
        -o $outputFile `
        --from markdown `
        --template=default `
        --pdf-engine=xelatex `
        -V CJKmainfont="Noto Serif CJK SC" `
        -V CJKmonofont="JetBrains Mono" `
        -V geometry:margin=2.5cm `
        --toc `
        --number-sections `
        --highlight-style=tango `
        --metadata-file=$metaFile
    
    Write-Host "✓ PDF 导出成功: $outputFile" -ForegroundColor Green
}
elseif ($Format -eq "epub") {
    pandoc $tempFile `
        -o $outputFile `
        --from markdown `
        --toc `
        --epub-cover-image="static/images/cover-$SeriesName.png" `
        --metadata-file=$metaFile
    
    Write-Host "✓ EPUB 导出成功: $outputFile" -ForegroundColor Green
}
elseif ($Format -eq "markdown") {
    Copy-Item $tempFile $outputFile -Force
    Write-Host "✓ Markdown 合集导出成功: $outputFile" -ForegroundColor Green
}

# 清理
Remove-Item $tempFile -ErrorAction SilentlyContinue
Remove-Item $metaFile -ErrorAction SilentlyContinue

Write-Host "`n导出完成！" -ForegroundColor Green