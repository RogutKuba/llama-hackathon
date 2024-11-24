import {
  clickAction,
  scrollAction,
  typeAction,
} from '@/app/browser-actions/actions';

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

  if (actionResponse.status === 'error') {
    throw new Error('Failed to get action!');
  }

  console.log('actionResponse', actionResponse);
  // if action is close, return null
  if (actionResponse.result.action.toLowerCase().includes('answer')) {
    return null;
  }

  // const actionResponse = {
  //   result: {
  //     action: 'click',
  //     x: 500,
  //     y: 475,
  //     ariaLabel: 'test',
  //     args: ['test'],
  //   },
  //   status: 'success',
  // } as ActionResponse;
  console.log('actionResponse', actionResponse);

  return actionResponse;
};

export const performActionInDom = async (actionResponse: ActionResponse) => {
  const { action, x, y, args } = actionResponse.result;

  console.log('performing action', action, x, y);

  switch (action.toLowerCase()) {
    case 'click':
      clickAction({ x, y });
      break;
    case 'scroll':
      scrollAction({
        direction: (() => {
          const arg = args[1];
          if (arg === 'up') return 'up';
          if (arg === 'down') return 'down';
          else return 'down';
        })(),
      });
      break;
    case 'type':
      typeAction({ text: args[1], x, y });
      break;
    default:
      throw new Error(`Unknown action: ${actionResponse}`);
  }
};
