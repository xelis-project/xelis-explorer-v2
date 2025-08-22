export const reduce_text = (text: string, maxLeft = 5, maxRight = 5) => {
  const length = text.length;
  if (length <= maxLeft + maxRight) return text;
  const start = text.substring(0, maxLeft);
  const end = text.substring(length - maxRight, length);
  return start + `...` + end;
}
