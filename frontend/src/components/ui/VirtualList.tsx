import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import styled from 'styled-components';

export interface VirtualListProps<T> {
  items: T[];
  itemHeight: number; // px
  height: number; // px
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number; // extra items above/below
  className?: string;
}

const Container = styled.div`
  position: relative;
  overflow: auto;
`;

const Inner = styled.div<{ $h: number }>`
  position: relative;
  height: ${({ $h }) => `${$h}px`};
`;

const ItemBox = styled.div<{ $top: number; $h: number }>`
  position: absolute;
  left: 0;
  right: 0;
  top: ${({ $top }) => `${$top}px`};
  height: ${({ $h }) => `${$h}px`};
`;

export function VirtualList<T>({ items, itemHeight, height, renderItem, overscan = 4, className }: VirtualListProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight]);
  const startIndex = useMemo(() => Math.max(0, Math.floor(scrollTop / itemHeight) - overscan), [scrollTop, itemHeight, overscan]);
  const endIndex = useMemo(() => Math.min(items.length, Math.ceil((scrollTop + height) / itemHeight) + overscan), [scrollTop, height, itemHeight, overscan]);
  const visibleItems = useMemo(() => items.slice(startIndex, endIndex), [items, startIndex, endIndex]);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setScrollTop(el.scrollTop);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <Container ref={ref} style={{ height }} className={className}>
      <Inner $h={totalHeight}>
        {visibleItems.map((item, i) => {
          const index = startIndex + i;
          const top = index * itemHeight;
          return (
            <ItemBox key={index} $top={top} $h={itemHeight}>
              {renderItem(item, index)}
            </ItemBox>
          );
        })}
      </Inner>
    </Container>
  );
}

export default VirtualList;