export function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lines = 0;
  const maxLines = 5;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
      lines++;

      if (lines >= maxLines) {
        if (n < words.length - 1) {
          context.fillText(line + '...', x, y);
          return;
        }
      }
    } else {
      line = testLine;
    }
  }

  context.fillText(line, x, y);
}
