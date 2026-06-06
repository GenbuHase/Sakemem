type RatingDisplayProps = {
  rating: number | null;
};

export function RatingDisplay({ rating }: RatingDisplayProps) {
  if (!rating) {
    return <span className="text-sm text-zinc-400">未評価</span>;
  }

  return (
    <span className="text-sm font-medium text-amber-600">
      {"★".repeat(rating)}
      <span className="text-zinc-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}
