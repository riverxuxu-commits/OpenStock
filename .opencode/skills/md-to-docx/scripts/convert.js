#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { markdownDocx, Packer } from 'markdown-docx';
import { Command } from 'commander';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('md2docx')
  .description('Convert Markdown files to DOCX format')
  .version('1.0.0')
  .argument('<input>', 'Input Markdown file path')
  .argument('<output>', 'Output DOCX file path')
  .option('-t, --title <title>', 'Document title')
  .option('-c, --creator <creator>', 'Document author/creator')
  .option('-d, --description <description>', 'Document description')
  .option('-s, --subject <subject>', 'Document subject')
  .option('-k, --keywords <keywords>', 'Document keywords (comma-separated)')
  .option('-v, --verbose', 'Verbose output')
  .action(async (input, output, options) => {
    try {
      if (options.verbose) {
        console.log(`Input: ${input}`);
        console.log(`Output: ${output}`);
        console.log('Options:', options);
      }

      const inputPath = path.resolve(input);
      const outputPath = path.resolve(output);

      if (!await fileExists(inputPath)) {
        console.error(`Error: Input file not found: ${inputPath}`);
        process.exit(1);
      }

      const markdown = await fs.readFile(inputPath, 'utf-8');

      const documentOptions = {
        title: options.title || path.basename(inputPath, '.md'),
        creator: options.creator,
        description: options.description,
        subject: options.subject,
        keywords: options.keywords
      };

      if (options.verbose) {
        console.log('Converting...');
      }

      const doc = await markdownDocx(markdown, documentOptions);
      const buffer = await Packer.toBuffer(doc);
      await fs.writeFile(outputPath, buffer);

      console.log(`✓ Successfully converted: ${outputPath}`);
    } catch (error) {
      console.error('Conversion failed:', error.message);
      process.exit(1);
    }
  });

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

program.parse();