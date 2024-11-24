import { clickAction, scrollAction } from '@/app/browser-actions/actions';

type ActionResponse = {
  action: string;
  x: number;
  y: number;
};

export const getAction = async (params: { prompt: string; url: string }) => {
  const response = await fetch('/api/action', {
    method: 'POST',
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to get action');
  }

  const { action, x, y } = (await response.json()) as ActionResponse;

  switch (action) {
    case 'click':
      clickAction({ x, y });
      break;
    case 'scroll':
      scrollAction({ direction: 'down' });
      break;
    // case
    default:
      throw new Error(`Unknown action: ${action}`);
  }
};
