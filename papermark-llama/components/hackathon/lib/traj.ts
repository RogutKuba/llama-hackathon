export const useTrajectory = () => {
  const trajectoriesKey = "trajectories";

  const getTrajectory = () => {
    const storedTrajectories = localStorage.getItem(trajectoriesKey);

    return storedTrajectories ? JSON.parse(storedTrajectories) : [];
  };

  const addTrajectory = (trajectoryToAdd: string[] | undefined) => {
    const trajectories = getTrajectory();
    if (trajectoryToAdd) {
      trajectories.push(...trajectoryToAdd);
    }
    localStorage.setItem(trajectoriesKey, JSON.stringify(trajectories));
  };

  const clearTrajectory = () => {
    localStorage.removeItem(trajectoriesKey);
  };

  return {
    getTrajectory,
    addTrajectory,
    clearTrajectory,
  };
};