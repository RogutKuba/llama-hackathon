import { clickAction, scrollAction } from '@/app/browser-actions/actions';

type ActionResponse = {
  status: 'success' | 'error';
  result: {
    action: string;
    x: number;
    y: number;
    ariaLabel: string;
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
  const response = await fetch('http://localhost:8000/search', {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get action');
  }

  const actionResponse = (await response.json()) as ActionResponse;
  console.log('actionResponse', actionResponse);

  // write in the dom a red box where the x and y coords are
  const { action, x, y } = actionResponse.result;

  const redBox = document.createElement('div');
  redBox.style.position = 'absolute';
  redBox.style.left = `${x}px`;
  redBox.style.top = `${y}px`;
  redBox.style.width = '10px';
  redBox.style.height = '10px';
  redBox.style.backgroundColor = 'red';
  redBox.style.zIndex = '1000';

  document.body.appendChild(redBox);

  console.log('action', action);
  console.log('x', x);
  console.log('y', y);

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

  return actionResponse;
};
