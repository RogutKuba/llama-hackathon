import html2canvas from 'html2canvas';

export const takeWindowScreenshot = async () => {
  const canvas = await html2canvas(document.body, {
    x: window.scrollX,
    y: window.scrollY,
    width: window.innerWidth,
    height: window.innerHeight,
  });
  return canvas.toDataURL();
};
