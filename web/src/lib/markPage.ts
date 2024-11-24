const customCSS = `
::-webkit-scrollbar {
    width: 10px;
}
::-webkit-scrollbar-track {
    background: #27272a;
}
::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 0.375rem;
}
::-webkit-scrollbar-thumb:hover {
    background: #555;
}
`;

function unmarkPage() {
  const styleTag = document.createElement('style');
  styleTag.textContent = customCSS;
  document.head.append(styleTag);

  let labels: any[] = [];
  // Unmark page logic
  for (const label of labels) {
    document.body.removeChild(label);
  }
  labels = [];
}

function markPage(): {
  x: number;
  y: number;
  type: string;
  text: string;
  ariaLabel: string;
}[] {
  const styleTag = document.createElement('style');
  styleTag.textContent = customCSS;
  document.head.append(styleTag);

  let labels: any[] = [];

  unmarkPage();

  const bodyRect: DOMRect = document.body.getBoundingClientRect();

  let items: {
    element: Element;
    include: boolean;
    area: number;
    rects: ClientRect[];
    text: string;
    type: string;
    ariaLabel: string;
  }[] = Array.from(document.querySelectorAll('*'))
    .map((element: any) => {
      const vw = Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0
      );
      const vh = Math.max(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0
      );
      const textualContent =
        element.textContent?.trim().replace(/\s{2,}/g, ' ') || '';
      const elementType = element.tagName.toLowerCase();
      const ariaLabel = element.getAttribute('aria-label') || '';

      const rects: any[] = [...element.getClientRects()]
        .filter((bb) => {
          const center_x = bb.left + bb.width / 2;
          const center_y = bb.top + bb.height / 2;
          const elAtCenter = document.elementFromPoint(center_x, center_y);
          return elAtCenter === element || element.contains(elAtCenter);
        })
        .map((bb) => {
          const rect = {
            left: Math.max(0, bb.left),
            top: Math.max(0, bb.top),
            right: Math.min(vw, bb.right),
            bottom: Math.min(vh, bb.bottom),
          };
          return {
            ...rect,
            width: rect.right - rect.left,
            height: rect.bottom - rect.top,
          };
        });

      const area = rects.reduce(
        (acc, rect) => acc + rect.width * rect.height,
        0
      );

      return {
        element,
        include:
          element.tagName === 'INPUT' ||
          element.tagName === 'TEXTAREA' ||
          element.tagName === 'SELECT' ||
          element.tagName === 'BUTTON' ||
          element.tagName === 'A' ||
          element.onclick != null ||
          window.getComputedStyle(element).cursor === 'pointer' ||
          element.tagName === 'IFRAME' ||
          element.tagName === 'VIDEO',
        area,
        rects,
        text: textualContent,
        type: elementType,
        ariaLabel,
      };
    })
    .filter((item) => item.include && item.area >= 20);

  // Only keep inner clickable items
  items = items.filter(
    (x) => !items.some((y) => x.element.contains(y.element) && !(x === y))
  );

  // Function to generate random colors
  function getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Create a floating border on top of these elements
  items.forEach((item, index) => {
    item.rects.forEach((bbox) => {
      const newElement = document.createElement('div');
      const borderColor = getRandomColor();
      newElement.style.outline = `2px dashed ${borderColor}`;
      newElement.style.position = 'fixed';
      newElement.style.left = `${bbox.left}px`;
      newElement.style.top = `${bbox.top}px`;
      newElement.style.width = `${bbox.width}px`;
      newElement.style.height = `${bbox.height}px`;
      newElement.style.pointerEvents = 'none';
      newElement.style.boxSizing = 'border-box';
      newElement.style.zIndex = '2147483647';

      // Add floating label at the corner
      const label = document.createElement('span');
      label.textContent = index.toString();
      label.style.position = 'absolute';
      label.style.top = '-19px';
      label.style.left = '0px';
      label.style.background = borderColor;
      label.style.color = 'white';
      label.style.padding = '2px 4px';
      label.style.fontSize = '12px';
      label.style.borderRadius = '2px';
      newElement.appendChild(label);

      document.body.appendChild(newElement);
      labels.push(newElement);
    });
  });

  const coordinates = items.flatMap((item) =>
    item.rects.map(({ left, top, width, height }) => ({
      x: (left + left + width) / 2,
      y: (top + top + height) / 2,
      type: item.type,
      text: item.text,
      ariaLabel: item.ariaLabel,
    }))
  );

  return coordinates;
}

export const annotatePage = () => {
  markPage();
};
