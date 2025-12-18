'use client';

import { useState, useEffect } from 'react';

export default function Portfolio() {
  const [stock, setStock] = useState('');
  const [portfolio, setPortfolio] = useState<any>(null);
  const [portfolioValue, setPortfolioValue] = useState(0);

  const userId = 1; // Replace with actual user ID from session

  const addStock = async () => {
    const response = await fetch('/api/portfolio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, stock }),
    });
    const data = await response.json();
    console.log(data);
    setStock('');
    getPortfolio();
  };

  const getPortfolio = async () => {
    const response = await fetch(`/api/portfolio?userId=${userId}`);
    const data = await response.json();
    setPortfolio(data.portfolio);
    setPortfolioValue(data.portfolioValue);
  };

  useEffect(() => {
    getPortfolio();
  }, []);

  return (
    <div>
      <h1>Portfolio</h1>
      <input
        type="text"
        placeholder="Stock Symbol"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
      />
      <button onClick={addStock}>Add Stock</button>

      {portfolio && (
        <div>
          <h2>Your Stocks</h2>
          <ul>
            {portfolio.stocks.map((s: string) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <h3>Total Portfolio Value: ${portfolioValue}</h3>
        </div>
      )}
    </div>
  );
}
