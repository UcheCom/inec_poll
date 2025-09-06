import React from 'react';
import { usePolls } from '../../hooks/usePolls';

export const PollList: React.FC = () => {
  const { polls } = usePolls();
  return (
    <div>
      <h2>Nigerian Elections</h2>
      <ul>
        {polls.map((poll) => (
          <li key={poll.id}>
            <strong>{poll.title}</strong> <br />
            <span>{poll.description}</span> <br />
            <span>Type: {poll.electionType}</span>
            {poll.state && <span> | State: {poll.state}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};
