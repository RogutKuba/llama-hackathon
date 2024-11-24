export const clickAction = (params: { x: number; y: number }) => {
  // click on the window in the x,y position
  const elemToClick = document.elementFromPoint(params.x, params.y);
  if (elemToClick instanceof HTMLElement) {
    elemToClick.click();
  }
};

export const scrollAction = (params: { direction: 'up' | 'down' }) => {
  // scroll the window in the direction
  window.scrollBy(0, params.direction === 'up' ? -100 : 100);
};

export const typeAction = (params: { text: string; x: number; y: number }) => {
  // type the text in the x,y position
  const elemToType = document.elementFromPoint(params.x, params.y);
  if (elemToType instanceof HTMLElement) {
    elemToType.textContent = params.text;
  }
};
