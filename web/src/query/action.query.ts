import { clickAction, scrollAction } from '@/app/browser-actions/actions';

type ActionResponse = {
  status: 'success' | 'error';
  result: {
    action: string;
    x: number;
    y: number;
  };
};

export const getAction = async (params: {
  user_prompt: string;
  url: string;
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

  const actionResponse = await response.json();
  // const { action, x, y } = actionResponse;

  const { x, y } = actionResponse.result[1];
  clickAction({ x, y });

  // switch (actionResponse.action) {
  //   case 'click':
  //     clickAction({ x, y });
  //     break;
  //   case 'scroll':
  //     scrollAction({ direction: 'down' });
  //     break;
  //   // case
  //   default:
  //     throw new Error(`Unknown action: ${actionResponse}`);
  // }

  return actionResponse;
};
