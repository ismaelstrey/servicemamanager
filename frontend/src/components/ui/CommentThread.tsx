import React from 'react';
import styled from 'styled-components';

export interface CommentItem {
  id: string;
  author: string;
  content: React.ReactNode;
  timestamp: string;
}

export interface CommentThreadProps extends React.HTMLAttributes<HTMLDivElement> {
  comments: CommentItem[];
}

const Thread = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Comment = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: ${({ theme }) => theme.spacing.sm};
`;

const Meta = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.ui.caption.fontSize};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

export const CommentThread: React.FC<CommentThreadProps> = ({ comments, ...props }) => {
  return (
    <Thread {...props}>
      {comments.map((c) => (
        <Comment key={c.id}>
          <Meta>{c.author} • {c.timestamp}</Meta>
          <div>{c.content}</div>
        </Comment>
      ))}
    </Thread>
  );
};

export default CommentThread;