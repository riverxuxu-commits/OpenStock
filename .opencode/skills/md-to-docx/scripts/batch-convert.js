#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { globby } from 'globby';
import { markdownDocx, Packer } from 'markdown-docx';
import { Command } from 'commander';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('batch-md2docx')
  .description('Batch convert Markdown files to DOCX format')
  .version('1.0.0')
  .argument('<pattern>', 'File pattern (e.g., "*.md" or "docs/**/*.md")')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('-t, --title <title>', 'Document title (use {{filename}} for filename)')
  .option('-c, --creator <creator>', 'Document author/creator')
  .option('-r, --recursive', 'Search recursively', true)
  .option('-v, --verbose', 'Verbose output')
  .action(async (pattern, options) => {
    try {
      const outputDir = path.resolve(options.output);

      if (!await dirExists(outputDir)) {
        await fs.mkdir(outputDir, { recursive: true });
      }

      const globOptions = {
        absolute: true,
        onlyFiles: true
      };

      if (options.recursive) {
        globOptions.expandDirectories = true;
      }

      const files = await globby(pattern, globOptions);

      if (files.length === 0) {
        console.log('No Markdown files found matching the pattern.');
        process.exit(0);
      }

      console.log(`Found ${files.length} file(s) to convert\n`);

      let success = 0;
      let failed = 0;

      for (const inputPath of files) {
        const baseName = path.basename(inputPath, '.md');
        const outputPath = path.join(outputDir, `${baseName}.docx`);

        if (options.verbose) {
          console.log(`Converting: ${inputPath}`);
        }

        try {
          const markdown = await fs.readFile(inputPath, 'utf-8');

          let title = options.title;
          if (title) {
            title = title.replace('{{filename}}', baseName);
          } else {
            title = baseName;
          }

          const doc = await markdownDocx(markdown, {
            title,
            creator: options.creator
          });

          const buffer = await Packer.toBuffer(doc);
          await fs.writeFile(outputPath, buffer);

          console.log(`✓ ${path.basename(outputPath)}`);
          success++;
        } catch (error) {
          console.error(`✗ Failed: ${path.basename(inputPath)} - ${error.message}`);
          failed++;
        }
      }

      console.log(`\n--- Summary ---`);
      console.log(`Total: ${files.length}`);
      console.log(`Success: ${success}`);
      console.log(`Failed: ${failed}`);
      console.log(`Output: ${outputDir}`);
    } catch (error) {
      console.error('Batch conversion failed:', error.message);
      process.exit(1);
    }
  });

async function dirExists(dirPath) {
  try {
    await fs.access(dirPath);
    return true;
  } catch {
    return false;
  }
}

program.parse();