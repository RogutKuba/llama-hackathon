import { clickAction, scrollAction } from '@/app/browser-actions/actions';

export type ActionResponse = {
  status: 'success' | 'error';
  result: {
    action: string;
    x: number;
    y: number;
    ariaLabel: string;
    args: string[];
  };
};

export const getAction = async (params: {
  user_prompt: string;
  // url: string;
  screenshot: string;
  coordinates: {
    x: number;
    y: number;
    type: string;
    text: string;
    ariaLabel: string;
  }[];
}) => {
  // const response = await fetch('http://localhost:8000/search', {
  //   method: 'POST',
  //   body: JSON.stringify(params),
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // });

  // if (!response.ok) {
  //   throw new Error('Failed to get action');
  // }

  // const actionResponse = (await response.json()) as ActionResponse;

  const actionResponse = {
    result: {
      action: 'click',
      x: 500,
      y: 475,
      ariaLabel: 'test',
      args: ['test'],
    },
    status: 'success',
  } as ActionResponse;
  console.log('actionResponse', actionResponse);

  // write in the dom a red box where the x and y coords are
  const { action, x, y } = actionResponse.result;

  // const redBox = document.createElement('div');
  // redBox.style.position = 'absolute';
  // redBox.style.left = `${x}px`;
  // redBox.style.top = `${y}px`;
  // redBox.style.width = '10px';
  // redBox.style.height = '10px';
  // redBox.style.backgroundColor = 'red';
  // redBox.style.zIndex = '1000';
  // document.body.appendChild(redBox);

  return actionResponse;
};

export const performActionInDom = async (actionResponse: ActionResponse) => {
  const { action, x, y } = actionResponse.result;

  console.log('performing action', action, x, y);

  switch (action.toLowerCase()) {
    case 'click':
      clickAction({ x, y });
      break;
    case 'scroll':
      scrollAction({ direction: 'down' });
      break;
    // case
    default:
      throw new Error(`Unknown action: ${actionResponse}`);
  }
};
