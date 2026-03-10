import { useState, useEffect } from "react";

export function useInvestidores(MOCK_INVESTIDORES) {

  const [investidores, setInvestidores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);

    try {

      const stored = JSON.parse(
        localStorage.getItem("MOCK_INVESTIDORES") || "[]"
      );

      if (stored.length === 0) {
        setInvestidores(MOCK_INVESTIDORES);
        localStorage.setItem(
          "MOCK_INVESTIDORES",
          JSON.stringify(MOCK_INVESTIDORES)
        );
      } else {
        setInvestidores(stored);
      }

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setInvestidores(MOCK_INVESTIDORES);
    } finally {
      setLoading(false);
    }
  };

  const save = (next) => {
    setInvestidores(next);
    localStorage.setItem("MOCK_INVESTIDORES", JSON.stringify(next));
  };

  return {
    investidores,
    setInvestidores,
    loading,
    save
  };
}