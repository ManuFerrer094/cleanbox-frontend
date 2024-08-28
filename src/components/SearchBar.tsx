"use client";

interface SearchBarProps {
    query: string;
    setQuery: (query: string) => void;
    handleSearch: () => void;
  }
  
  export default function SearchBar({ query, setQuery, handleSearch }: SearchBarProps) {
    return (
      <div className="mb-4 flex space-x-2">
        <input
          type="text"
          placeholder="Buscar correos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 p-2 rounded-lg flex-grow bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Buscar
        </button>
      </div>
    );
  }
  