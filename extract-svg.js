import fs from 'fs';

const logPath = 'C:/Users/Staff/.gemini/antigravity/brain/b5385c83-0bca-42ca-8dac-0a8a31c97811/.system_generated/logs/transcript.jsonl';
const targetPath = 'c:/Users/Staff/Desktop/xaujournal/public/logo-horizontal.svg';

try {
  const content = fs.readFileSync(logPath, 'utf8');
  
  // Find where '<svg version="1.1"' starts (JSON escaped format is <svg version=\"1.1\")
  const svgStartIndex = content.indexOf('<svg version=\\"1.1\\"');
  if (svgStartIndex === -1) {
    console.error('Could not find starting tag in transcript.jsonl');
  } else {
    // Find the next "</svg>" after svgStartIndex
    const svgEndIndex = content.indexOf('</svg>', svgStartIndex);
    if (svgEndIndex === -1) {
      console.error('Could not find ending tag </svg> in transcript.jsonl');
    } else {
      let svg = content.substring(svgStartIndex, svgEndIndex + 6);
      // Clean up JSON escaping
      svg = svg.replace(/\\n/g, '\n')
               .replace(/\\t/g, '\t')
               .replace(/\\"/g, '"')
               .replace(/\\\\/g, '\\');
               
      fs.writeFileSync(targetPath, svg, 'utf8');
      console.log('SUCCESS: Extracted the correct SVG and wrote to public/logo-horizontal.svg');
    }
  }
} catch (err) {
  console.error('FATAL ERROR:', err.message);
}
