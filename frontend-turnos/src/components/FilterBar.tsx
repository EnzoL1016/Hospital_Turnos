interface FilterOption {
  key: string;
  label: string;
  color: string;
  count: number;
}

interface FilterBarProps {
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function FilterBar({ filters, activeFilter, onFilterChange }: FilterBarProps) {
  const getColorClasses = (color: string, isActive: boolean) => {
    if (!isActive) {
      return "bg-gray-200 text-gray-800 hover:bg-gray-300";
    }

    const colorMap: Record<string, string> = {
      blue: "bg-blue-600 text-white",
      yellow: "bg-yellow-600 text-white",
      green: "bg-green-600 text-white",
      red: "bg-red-600 text-white",
      gray: "bg-gray-600 text-white",
    };
    return colorMap[color] || "bg-blue-600 text-white";
  };

  const getBadgeColorClasses = (color: string, isActive: boolean) => {
    if (!isActive) {
      return "bg-gray-400 text-white";
    }

    const colorMap: Record<string, string> = {
      blue: "bg-blue-500",
      yellow: "bg-yellow-500",
      green: "bg-green-500",
      red: "bg-red-500",
      gray: "bg-gray-500",
    };

    return colorMap[color] || "bg-blue-500";
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-gray-200 pb-4">
      {filters.map(({ key, label, color, count }) => {
        const isActive = activeFilter === key;
        return (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 ${getColorClasses(
              color,
              isActive
            )}`}
          >
            {label}
            <span
              className={`text-xs font-bold rounded-full px-2 py-0.5 ${getBadgeColorClasses(
                color,
                isActive
              )}`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
