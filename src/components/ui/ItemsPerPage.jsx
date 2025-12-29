export const ItemsPerPage = ({ value, onChange, options = [5, 10, 25, 50, 100], className = '' }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label htmlFor="itemsPerPage" className="text-sm text-gray-700">
        Itens por página:
      </label>
      <select
        id="itemsPerPage"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input py-1 text-sm"
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};