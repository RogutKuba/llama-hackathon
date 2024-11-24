import { clickAction, scrollAction, typeAction } from "./lib/actions";
import { setStorageState } from "./lib/checkRefresh";
import { useTrajectory } from "./lib/traj";

export type ActionResponse = {
  status: "success" | "error";
  result: {
    action: string;
    args: string[];
    trajectory: string[];
    x?: number;
    y?: number;
    ariaLabel?: string;
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
  const { addTrajectory, getTrajectory } = useTrajectory();

  const trajectory = getTrajectory();
  console.log("trajectories", trajectory);

  setStorageState({
    prompt: params.user_prompt,
    wasRunning: true,
  });

  const response = await fetch("http://localhost:8000/search", {
    method: "POST",
    body: JSON.stringify({
      ...params,
      trajectory,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get action");
  }

  const actionResponse = (await response.json()) as ActionResponse;

  if (actionResponse.status === "error") {
    throw new Error("Failed to get action!");
  }

  const rawRes = actionResponse.result as any;
  if (rawRes.error) {
    return null;
  }

  console.log("actionResponse", actionResponse);

  addTrajectory(actionResponse.result.trajectory);
  // if action is close, return null
  if (actionResponse.result.action.toLowerCase().includes("answer")) {
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
  console.log("actionResponse", actionResponse);

  // if action response is scroll, force x and y to be 0
  if (actionResponse.result.action.toLowerCase().includes("scroll")) {
    actionResponse.result.x = 0;
    actionResponse.result.y = 0;
  }

  return actionResponse;
};

export const performActionInDom = async (actionResponse: ActionResponse) => {
  const { action, x, y, args } = actionResponse.result;

  console.log("performing action", action, x, y);

  switch (action.toLowerCase()) {
    case "click":
      if (!x || !y) {
        throw new Error("No x or y provided for click action");
      }

      clickAction({ x, y });
      break;
    case "scroll":
      scrollAction({
        direction: (() => {
          const arg = args[1];
          if (arg === "up") return "up";
          if (arg === "down") return "down";
          else return "down";
        })(),
      });
      break;
    case "type":
      const textToType = args[1];

      if (!textToType) {
        throw new Error("No text to type provided for type action");
      }

      if (!x || !y) {
        throw new Error("No x or y provided for type action");
      }

      typeAction({ text: textToType, x, y });
      break;
    case "answer":
    case "answer;":
      break;
    default:
      throw new Error(`Unknown action: ${actionResponse}`);
  }
};
