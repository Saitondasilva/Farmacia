export const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, trend }) => {
  const colors = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-50' },
    green: { bg: 'bg-green-500', text: 'text-green-500', light: 'bg-green-50' },
    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-500', light: 'bg-yellow-50' },
    red: { bg: 'bg-red-500', text: 'text-red-500', light: 'bg-red-50' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-500', light: 'bg-purple-50' },
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-500', light: 'bg-indigo-50' }
  };

  const colorConfig = colors[color] || colors.blue;

  return (
    <div className="card p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${colorConfig.light}`}>
          <Icon className={`w-6 h-6 ${colorConfig.text}`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {trend !== undefined && (
              <span className={`text-sm ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {trend !== 0 ? `${Math.abs(trend)}%` : ''}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};