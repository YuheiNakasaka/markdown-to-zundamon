import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const MANUSCRIPTS_DIR = path.resolve(__dirname, "../manuscripts");
const GS_PATH = "gs";

function getPageCount(pdfPath: string): number {
  const output = execSync(
    `${GS_PATH} -q -dNODISPLAY -dNOSAFER -c "(${pdfPath}) (r) file runpdfbegin pdfpagecount = quit"`,
    { encoding: "utf-8" }
  );
  return parseInt(output.trim(), 10);
}

function convertPage(
  pdfPath: string,
  pageNum: number,
  outputPath: string
): void {
  execSync(
    `${GS_PATH} -dNOPAUSE -dBATCH -dNOSAFER -sDEVICE=png16m -r150 -dFirstPage=${pageNum} -dLastPage=${pageNum} -sOutputFile=${outputPath} ${pdfPath}`,
    { stdio: "pipe" }
  );
}

function main() {
  const pdfPath = process.argv[2];
  if (!pdfPath) {
    console.error("Usage: npm run pdf-to-manuscript -- <pdf-file>");
    process.exit(1);
  }

  const resolvedPdfPath = path.resolve(pdfPath);
  if (!fs.existsSync(resolvedPdfPath)) {
    console.error(`Error: PDF file not found: ${resolvedPdfPath}`);
    process.exit(1);
  }

  const projectName = path.basename(resolvedPdfPath, ".pdf");
  const imagesDir = path.join(MANUSCRIPTS_DIR, projectName, "images");
  const mdOutputPath = path.join(MANUSCRIPTS_DIR, `${projectName}.md`);

  if (fs.existsSync(mdOutputPath)) {
    console.error(`Error: Manuscript already exists: ${mdOutputPath}`);
    console.error("Delete it first if you want to regenerate.");
    process.exit(1);
  }

  fs.mkdirSync(imagesDir, { recursive: true });

  console.log(`Converting PDF: ${resolvedPdfPath}`);
  console.log(`Project name: ${projectName}`);

  const pageCount = getPageCount(resolvedPdfPath);
  console.log(`Total pages: ${pageCount}`);
  console.log("Converting pages...");

  for (let i = 1; i <= pageCount; i++) {
    const pageName = `page-${String(i).padStart(3, "0")}.png`;
    const outputPath = path.join(imagesDir, pageName);
    convertPage(resolvedPdfPath, i, outputPath);
    console.log(`  Page ${i}/${pageCount} → ${pageName}`);
  }

  const lines: string[] = [];

  lines.push("---");
  lines.push("fps: 30");
  lines.push("width: 1920");
  lines.push("height: 1080");
  lines.push("slideTransitionMs: 600");
  lines.push("speechGapMs: 200");
  lines.push("characters:");
  lines.push("  - name: ずんだもん");
  lines.push("    speakerId: 3");
  lines.push("    position: right");
  lines.push('    color: "#4a8a2a"');
  lines.push("---");
  lines.push("");

  for (let i = 1; i <= pageCount; i++) {
    const pageNum = String(i).padStart(3, "0");
    const relImagePath = `./${projectName}/images/page-${pageNum}.png`;

    lines.push(`# ページ${i}`);
    lines.push("");
    lines.push(`> ![](${relImagePath})`);
    lines.push("");
    lines.push(`ここにページ${i}のトークスクリプトを書くのだ`);
    lines.push("");
  }

  fs.writeFileSync(mdOutputPath, lines.join("\n"));

  console.log("");
  console.log(`Generated: ${mdOutputPath}`);
  console.log(`Images: ${imagesDir}/`);
  console.log("");
  console.log("Next steps:");
  console.log(
    `  1. Edit ${path.relative(process.cwd(), mdOutputPath)} to add talk scripts`
  );
  console.log(
    `  2. npm run preprocess -- ${path.relative(process.cwd(), mdOutputPath)}`
  );
  console.log(`  3. npm run studio -- ${projectName}`);
  console.log(`  4. npm run render -- ${projectName}`);
}

main();
