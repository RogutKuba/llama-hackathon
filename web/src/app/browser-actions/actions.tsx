export const clickAction = (params: { x: number; y: number }) => {
  // click on the window in the x,y position
  const elemToClick = document.elementFromPoint(params.x, params.y);
  console.log('elemToClick', elemToClick);
  if (elemToClick instanceof HTMLElement) {
    console.log('clicking');
    elemToClick.click();
  }
};

export const scrollAction = (params: { direction: 'up' | 'down' }) => {
  // scroll the window in the direction smoothly one whole window down negative if up
  window.scrollBy({
    top: params.direction === 'up' ? -window.innerHeight : window.innerHeight,
    behavior: 'smooth',
  });
};

export const typeAction = (params: { text: string; x: number; y: number }) => {
  // type the text in the x,y position
  const elemToType = document.elementFromPoint(params.x, params.y);
  if (elemToType instanceof HTMLElement) {
    // check if the element is a text input
    if (elemToType instanceof HTMLInputElement) {
      elemToType.value = params.text;
    } else {
      elemToType.textContent = params.text;
    }
  }
};
