import Link from "next/link";

type AxisCardProps = {
  code: string;
  title: string;
  purpose?: string;
  objectives?: string[];
};

export default function AxisCard({
  code,
  title,
  purpose,
  objectives = [],
}: AxisCardProps) {
  const axisNumber = code.replace("AXE ", "");

  return (
    <Link
      href={`/dashboard/psd#axe-${axisNumber}`}
      className="block rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
          {code}
        </span>
        <span className="text-sm text-slate-400">→</span>
      </div>

      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>

      {purpose && (
        <p className="mt-2 text-sm leading-6 text-slate-600">{purpose}</p>
      )}

      {objectives.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Objectifs
          </p>

          <ul className="space-y-1">
            {objectives.slice(0, 3).map((objective) => (
              <li
                key={objective}
                className="text-sm text-slate-600"
              >
                • {objective}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Link>
  );
}
