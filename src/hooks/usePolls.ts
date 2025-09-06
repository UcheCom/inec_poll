// src/hooks/usePolls.ts
import { usePollContext } from '../context/PollContext';

export const usePolls = () => {
    const { polls, getPollById } = usePollContext();
    return { polls, getPollById };
};
