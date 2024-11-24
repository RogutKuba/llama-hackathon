export const clickAction = (params: { x: number; y: number }) => {
  // click on the window in the x,y position
  const elemToClick = document.elementFromPoint(params.x, params.y);
  console.log("elemToClick", elemToClick);
  if (elemToClick instanceof HTMLElement) {
    console.log("clicking");
    elemToClick.click();

    // also send mouse down event
    const mouseDownEvent = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      button: 0,
    });
    elemToClick.dispatchEvent(mouseDownEvent);
  }
};

export const scrollAction = (params: { direction: "up" | "down" }) => {
  // scroll the window in the direction smoothly one whole window down negative if up
  window.scrollBy({
    top: params.direction === "up" ? -window.innerHeight : window.innerHeight,
    behavior: "smooth",
  });
};

export const typeAction = (params: { text: string; x: number; y: number }) => {
  // type the text in the x,y position
  const elemToType = document.elementFromPoint(params.x, params.y);

  console.log("elemToType", elemToType);

  const inputTypes = [
    window.HTMLInputElement,
    window.HTMLSelectElement,
    window.HTMLTextAreaElement,
  ];

  if (elemToType instanceof HTMLElement) {
    // check if the element is a text input
    if (elemToType instanceof HTMLInputElement) {
      // elemToType.value = params.text;

      const rawElem = elemToType as any;

      // only process the change on elements we know have a value setter in their constructor
      if (inputTypes.indexOf(rawElem.__proto__.constructor) > -1) {
        console.log("elemToType.__proto__.constructor");
        const setValue = Object.getOwnPropertyDescriptor(
          rawElem.__proto__,
          "value",
        )?.set;
        const event = new Event("input", { bubbles: true });

        console.log("setValue", setValue);

        setValue?.call(elemToType, params.text);
        elemToType.dispatchEvent(event);
      }

      // const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      //   window.HTMLInputElement.prototype,
      //   "value",
      // )?.set;

      // console.log("nativeInputValueSetter", nativeInputValueSetter);
      // if (nativeInputValueSetter) {
      //   console.log("setting value");
      //   nativeInputValueSetter.call(elemToType, params.text);
      // }

      // // const reactElem = elemToType as any;
      // // const tracker = reactElem._valueTracker;
      // // console.log("tracker", tracker);
      // // if (tracker) {
      // //   tracker.setValue(params.text);
      // // }
      // const event = new Event("change", { bubbles: true });
      // elemToType.dispatchEvent(event);
      // console.log("input event sent");
    } else {
      elemToType.textContent = params.text;
      // send a change event to the element
      const changeEvent = new Event("change", { bubbles: true });
      elemToType.dispatchEvent(changeEvent);

      console.log("change event sent");
    }
  }
};
