import React from "react";
import Chip from "./chip";


type Props = {
  page: number;
  pageCount: number;
  onPageChange: (p: number) => void;
};

const DOTS = "…";
const SIBLING_COUNT = 2; 

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => i + start);
}

/** Build items like [1, "…", 8, 9, 10, "…", 13] */
function getPageItems(totalPages: number, current: number, siblingCount = SIBLING_COUNT) {
  const totalNumbers = siblingCount * 2 + 5; // first, last, current + two dots
  if (totalPages <= totalNumbers) return range(1, totalPages);

  const left = Math.max(current - siblingCount, 1);
  const right = Math.min(current + siblingCount, totalPages);

  const showLeftDots = left > 2;
  const showRightDots = right < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    // only right dots
    const leftRange = range(1, 3 + 2 * siblingCount);
    return [...leftRange, DOTS, totalPages];
  }

  if (showLeftDots && !showRightDots) {
    // only left dots
    const rightRange = range(
      totalPages - (3 + 2 * siblingCount) + 1,
      totalPages
    );
    return [1, DOTS, ...rightRange];
  }

  // both sides have dots
  const middleRange = range(left, right);
  return [1, DOTS, ...middleRange, DOTS, totalPages];
}

const Pager: React.FC<Props> = ({
  page,
  pageCount,
  onPageChange,
}) => {
  if (pageCount <= 1) return null;

  const items = getPageItems(pageCount, page);

  return (
    <nav className="flex items-center justify-center gap-2 mt-6" aria-label="Pagination">
      <Chip onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Prev
      </Chip>

      {items.map((it, idx) =>
        it === DOTS ? (
          <span
            key={`dots-${idx}`}
            className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm text-muted-foreground select-none"
            aria-hidden
          >
            {DOTS}
          </span>
        ) : (
          <Chip
            key={it as number}
            active={it === page}
            aria-current={it === page ? "page" : undefined}
            onClick={() => onPageChange(it as number)}
          >
            {it}
          </Chip>
        )
      )}

      <Chip
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
      >
        Next
      </Chip>
    </nav>
  );
};

export default Pager;
