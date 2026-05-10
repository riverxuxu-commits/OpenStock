---
name: md-to-docx
description: 当用户需要将 Markdown 文件转换为 DOCX（Word）文档时使用此技能。这包括单个文件转换、批量转换、自定义样式、添加标题和元数据等任务。
license: MIT
---

# Markdown to DOCX 转换指南

## Overview

本 skill 提供将 Markdown 文件转换为 Microsoft Word (DOCX) 文档的功能，支持丰富的格式转换和自定义选项。

## Quick Start

### 基本转换

```javascript
import markdownDocx, { Packer } from 'markdown-docx';
import fs from 'node:fs/promises';

async function convert(inputPath, outputPath) {
  const markdown = await fs.readFile(inputPath, 'utf-8');
  const doc = await markdownDocx(markdown);
  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile(outputPath, buffer);
  console.log('Conversion completed!');
}

convert('input.md', 'output.docx');
```

### 使用 CLI

```bash
# 基本转换
node .opencode/skills/md-to-docx/scripts/convert.js input.md output.docx

# 带标题
node .opencode/skills/md-to-docx/scripts/convert.js input.md output.docx --title "My Document"

# 批量转换
node .opencode/skills/md-to-docx/scripts/batch-convert.js "*.md" --output ./docs
```

## 支持的 Markdown 特性

### 标题

```markdown
# 一级标题
## 二级标题
### 三级标题
```

会转换为 Word 中的 Heading 1-3 样式。

### 列表

```markdown
- 无序列表项 1
- 无序列表项 2
  - 嵌套列表

1. 有序列表项
2. 有序列表项

- [ ] 任务列表
- [x] 已完成任务
```

### 代码块

````markdown
```javascript
function hello() {
  console.log('Hello, World!');
}
```
````

支持多种语言的语法高亮。

### 表格

```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容 | 内容 | 内容 |
```

### 图片

```markdown
![Alt text](./image.png)

![Remote image](https://example.com/image.jpg)
```

支持本地路径和远程 URL。

### 链接和格式化

```markdown
[链接文本](https://example.com)

**粗体** 和 *斜体*

~~删除线~~

`行内代码`
```

## 自定义选项

### MarkdownDocx 类

```javascript
import { MarkdownDocx, Packer } from 'markdown-docx';

const markdown = await fs.readFile('input.md', 'utf-8');

const converter = new MarkdownDocx(markdown);

const doc = await converter.toDocument({
  title: 'Document Title',
  creator: 'Author Name',
  description: 'Document description',
  subject: 'Subject',
  keywords: 'keyword1, keyword2'
});

const buffer = await Packer.toBuffer(doc);
await fs.writeFile('output.docx', buffer);
```

### 可用选项

| 选项 | 类型 | 说明 |
|-----|------|------|
| `title` | string | 文档标题 |
| `creator` | string | 作者 |
| `description` | string | 文档描述 |
| `subject` | string | 主题 |
| `keywords` | string | 关键词（逗号分隔） |

## 批量转换

使用 `batch-convert.js` 脚本：

```bash
node scripts/batch-convert.js "docs/**/*.md" --output ./output
node scripts/batch-convert.js "*.md" --output ./output --pattern "**/*.md"
```

## 故障排除

### 图片无法显示

- 确保本地图片路径正确（相对或绝对路径）
- 远程图片需要网络连接
- 检查输出目录是否有写入权限

### 中文显示异常

- 确保文件编码为 UTF-8
- 检查系统是否安装了中文字体

### 代码块格式丢失

- 某些复杂语法高亮可能无法完美转换
- 可以使用纯文本代码块作为备份

## 下一步

- 高级用法和更多示例请参阅 REFERENCE.md
- 批量处理脚本请使用 scripts/batch-convert.js