type OverviewCardProps = {
  label: string;
  value: string;
  description: string;
};

export default function OverviewCard({
  label,
  value,
  description,
}: OverviewCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
