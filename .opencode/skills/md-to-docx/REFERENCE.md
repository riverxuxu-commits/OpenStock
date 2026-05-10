# Markdown to DOCX 高级参考

本文档提供更详细的转换选项、自定义样式配置以及高级用例。

## 目录

- [高级配置](#高级配置)
- [自定义样式](#自定义样式)
- [图片处理](#图片处理)
- [表格处理](#表格处理)
- [代码高亮](#代码高亮)
- [高级用例](#高级用例)

---

## 高级配置

### MarkdownDocx 详细选项

```javascript
import { MarkdownDocx, Packer } from 'markdown-docx';

const markdown = `
# Title

Content here.
`;

const converter = new MarkdownDocx(markdown);

const doc = await converter.toDocument({
  // 元数据
  title: 'Technical Documentation',
  creator: 'Documentation Team',
  description: 'Comprehensive technical guide',
  subject: 'Technology',
  keywords: 'guide, tutorial, reference',
  
  // 文档属性
  margins: {
    top: 1440,    // 1 inch in twips (1 inch = 1440 twips)
    right: 1440,
    bottom: 1440,
    left: 1440
  },
  
  // 页面设置
  pageSize: {
    width: 12240,  // Letter width in twips (8.5 inches)
    height: 15840  // Letter height in twips (11 inches)
  }
});

const buffer = await Packer.toBuffer(doc);
```

### 页面尺寸常量

```javascript
// 常用页面尺寸（单位：twips, 1 inch = 1440 twips）
const PAGE_SIZES = {
  LETTER: { width: 12240, height: 15840 },      // 8.5" x 11"
  A4: { width: 11906, height: 16838 },          // 210mm x 297mm
  A5: { width: 8391, height: 11906 },           // 148mm x 210mm
  LEGAL: { width: 12240, height: 20160 },       // 8.5" x 14"
  TABLOID: { width: 17280, height: 22176 }       // 11" x 17"
};
```

---

## 自定义样式

### 使用自定义样式配置

```javascript
import { MarkdownDocx, Packer } from 'markdown-docx';

const converter = new MarkdownDocx(markdown, {
  // 标题样式
  styles: {
    heading1: {
      fontSize: 32,
      bold: true,
      color: '1F4788'
    },
    heading2: {
      fontSize: 26,
      bold: true,
      color: '2E74B5'
    },
    heading3: {
      fontSize: 22,
      bold: true,
      color: '2E74B5'
    },
    // 代码块样式
    codeBlock: {
      fontSize: 10,
      fontFace: 'Consolas',
      backgroundColor: 'F5F5F5'
    },
    // 链接样式
    link: {
      color: '0563C1',
      underline: true
    }
  },
  
  // 段落间距
  paragraphSpacing: {
    before: 120,
    after: 120,
    line: 276
  }
});

const doc = await converter.toDocument();
```

### 预设样式主题

```javascript
// 现代风格
const MODERN_THEME = {
  heading1: { fontSize: 32, bold: true, color: '2C3E50' },
  heading2: { fontSize: 26, bold: true, color: '34495E' },
  heading3: { fontSize: 22, bold: true, color: '7F8C8D' },
  body: { fontSize: 11, fontFace: 'Calibri' },
  codeBlock: { fontSize: 10, fontFace: 'Consolas', backgroundColor: 'F8F8F8' }
};

// 学术风格
const ACADEMIC_THEME = {
  heading1: { fontSize: 24, bold: true, color: '000000' },
  heading2: { fontSize: 18, bold: true, color: '333333' },
  heading3: { fontSize: 14, bold: true, color: '666666' },
  body: { fontSize: 12, fontFace: 'Times New Roman' },
  codeBlock: { fontSize: 10, fontFace: 'Courier New', backgroundColor: 'FFFFCC' }
};
```

---

## 图片处理

### 本地图片

```javascript
const markdown = `
# Document with Images

![Local Image](./images/photo.png)

![Absolute Path](/Users/name/Documents/image.jpg)
`;

const doc = await markdownDocx(markdown, {
  // 图片尺寸配置
  imageOptions: {
    maxWidth: 500,    // 最大宽度（像素）
    maxHeight: 400,   // 最大高度（像素）
    maintainAspectRatio: true
  }
});
```

### 远程图片

```javascript
const markdown = `
# Remote Images

![Logo](https://example.com/logo.png)
`;

const doc = await markdownDocx(markdown, {
  // 远程图片下载选项
  remoteImageOptions: {
    timeout: 10000,           // 超时（毫秒）
    retryAttempts: 3,         // 重试次数
    headers: {
      'User-Agent': 'md2docx/1.0'
    }
  }
});
```

### 图片对齐

```markdown
![Center aligned image](./image.png){.center}
![Left aligned image](./image.png){.left}
![Right aligned image](./image.png){.right}
```

---

## 表格处理

### 基础表格

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |
```

### 表格对齐

```markdown
| Left | Center | Right |
|:-----|:------:|------:|
| L    | C      | R     |
```

### 复杂表格

```markdown
| 合并单元格 |              |            |
|-----------|--------------|------------|
| Row 1     | Cell 1      | Cell 2     |
| Row 2     | Multi-line content |
|           | More content |
```

### 表格样式

```javascript
const doc = await markdownDocx(markdown, {
  tableOptions: {
    headerBackground: 'D9E2F3',
    borderColor: 'B4C6E7',
    borderSize: 4
  }
});
```

---

## 代码高亮

### 支持的语言

- JavaScript / TypeScript
- Python
- Java
- C / C++ / C#
- Go
- Rust
- HTML / CSS
- SQL
- JSON / YAML
- Markdown
- Shell / Bash

### 代码块选项

```javascript
const markdown = `
\`\`\`javascript
function hello() {
  console.log('Hello!');
}
\`\`\`
`;

const doc = await markdownDocx(markdown, {
  codeBlockOptions: {
    showLineNumbers: true,
    theme: 'monokai',      // 或 'github', 'default'
    fontSize: 10,
    fontFace: 'Fira Code'
  }
});
```

### 行号和行高亮

````markdown
```javascript {1,3-5}
function hello() {    // 行1
  console.log(1);     // 行2
  console.log(2);     // 行3
  console.log(3);     // 行4
  console.log(4);     // 行5
}
```
````

---

## 高级用例

### 生成技术文档

```javascript
import fs from 'node:fs/promises';
import { MarkdownDocx, Packer } from 'markdown-docx';

async function generateTechnicalDoc(inputDir, outputDir) {
  const files = await fs.readdir(inputDir);
  const markdownFiles = files.filter(f => f.endsWith('.md'));
  
  for (const file of markdownFiles) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file.replace('.md', '.docx'));
    
    const markdown = await fs.readFile(inputPath, 'utf-8');
    
    const doc = await markdownDocx(markdown, {
      title: file.replace('.md', ''),
      creator: 'Technical Documentation System',
      subject: 'Technical Guide',
      styles: MODERN_THEME,
      tableOptions: {
        headerBackground: 'E7E6E6',
        borderColor: 'CCCCCC',
        borderSize: 4
      },
      codeBlockOptions: {
        showLineNumbers: true,
        fontSize: 9
      }
    });
    
    const buffer = await Packer.toBuffer(doc);
    await fs.writeFile(outputPath, buffer);
  }
}

generateTechnicalDoc('./docs', './output');
```

### 生成学术论文

```javascript
const doc = await markdownDocx(academicMarkdown, {
  title: 'Research Paper Title',
  creator: 'Author Name',
  subject: 'Academic Research',
  keywords: 'research, analysis, methodology',
  styles: ACADEMIC_THEME,
  margins: {
    top: 1440,
    right: 1440,
    bottom: 1440,
    left: 1440
  },
  pageSize: PAGE_SIZES.A4
});
```

### 带目录的文档

```javascript
const doc = await markdownDocx(markdown, {
  title: 'Table of Contents Document',
  includeTableOfContents: true,
  tocTitle: '目录',
  tocLevel: 3
});
```

### 合并多个 Markdown 文件

```javascript
async function mergeDocuments(filePaths, outputPath) {
  let combinedMarkdown = '';
  
  for (const filePath of filePaths) {
    const content = await fs.readFile(filePath, 'utf-8');
    combinedMarkdown += content + '\n\n---\n\n';
  }
  
  const doc = await markdownDocx(combinedMarkdown, {
    title: 'Merged Document'
  });
  
  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile(outputPath, buffer);
}

mergeDocuments([
  'chapters/chapter1.md',
  'chapters/chapter2.md',
  'chapters/chapter3.md'
], 'merged-document.docx');
```

---

## 错误处理

### 常见错误及解决方案

```javascript
import { markdownDocx, Packer } from 'markdown-docx';
import fs from 'node:fs/promises';

async function safeConvert(inputPath, outputPath) {
  try {
    const markdown = await fs.readFile(inputPath, 'utf-8');
    
    if (!markdown.trim()) {
      throw new Error('Input file is empty');
    }
    
    if (markdown.length > 5 * 1024 * 1024) {
      console.warn('Warning: Large file, conversion may take a while');
    }
    
    const doc = await markdownDocx(markdown);
    const buffer = await Packer.toBuffer(doc);
    await fs.writeFile(outputPath, buffer);
    
    return { success: true, outputPath };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      inputPath
    };
  }
}

// 使用示例
const result = await safeConvert('input.md', 'output.docx');

if (result.success) {
  console.log(`✓ Saved to ${result.outputPath}`);
} else {
  console.error(`✗ Error: ${result.error}`);
  console.error(`  File: ${result.inputPath}`);
}
```

### 图片加载错误处理

```javascript
const doc = await markdownDocx(markdown, {
  imageOptions: {
    onError: (imagePath, error) => {
      console.warn(`Failed to load image: ${imagePath}`);
      console.warn(`Error: ${error.message}`);
      // 返回占位符或跳过
    },
    fallbackImage: './placeholder.png'  // 备用图片
  }
});
```

---

## 性能优化

### 大文件处理

```javascript
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

async function convertLargeFile(inputPath, outputPath) {
  // 分块读取（适用于超大文件）
  const fileHandle = await fs.open(inputPath, 'r');
  const stats = await fileHandle.stat();
  
  const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
  let content = '';
  
  for (let offset = 0; offset < stats.size; offset += CHUNK_SIZE) {
    const { buffer } = await fileHandle.read({
      length: CHUNK_SIZE,
      position: offset
    });
    content += buffer.toString('utf-8');
  }
  
  await fileHandle.close();
  
  const doc = await markdownDocx(content);
  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile(outputPath, buffer);
}
```

### 批量处理优化

```javascript
async function batchConvert(filePaths, outputDir, options = {}) {
  const { concurrency = 5 } = options;
  
  const results = [];
  
  for (let i = 0; i < filePaths.length; i += concurrency) {
    const batch = filePaths.slice(i, i + concurrency);
    
    const batchResults = await Promise.all(
      batch.map(async (filePath) => {
        try {
          await convertToDocx(filePath, outputDir);
          return { success: true, file: filePath };
        } catch (error) {
          return { success: false, file: filePath, error: error.message };
        }
      })
    );
    
    results.push(...batchResults);
    
    // 进度报告
    console.log(`Progress: ${Math.min(i + concurrency, filePaths.length)}/${filePaths.length}`);
  }
  
  return results;
}
```

---

## 许可证

本项目基于 MIT 许可证开源。