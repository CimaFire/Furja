import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CurrencyExchange = () => {
  const [rates, setRates] = useState([]);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/currency/rates');
      setRates(response.data);
    } catch (error) {
      console.error('Failed to fetch rates');
    }
  };

  const handleConvert = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/currency/convert',
        {
          fromCurrency,
          toCurrency,
          amount: parseFloat(amount)
        }
      );
      setResult(response.data);
    } catch (error) {
      alert('فشل التحويل');
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">💱 تحويل العملات</h1>

        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="mb-6">
            <label className="block mb-2 font-bold">المبلغ</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-700 text-white p-3 rounded"
              step="0.01"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2 font-bold">من</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full bg-gray-700 text-white p-3 rounded"
              >
                {rates.map(rate => (
                  <option key={rate.code} value={rate.code}>
                    {rate.code} - {rate.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 font-bold">إلى</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full bg-gray-700 text-white p-3 rounded"
              >
                {rates.map(rate => (
                  <option key={rate.code} value={rate.code}>
                    {rate.code} - {rate.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleConvert}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-lg mb-6"
          >
            تحويل
          </button>

          {result && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-lg font-bold mb-2">
                {result.originalAmount} {result.from} = {result.convertedAmount} {result.to}
              </p>
              <p className="text-sm opacity-75">
                السعر: 1 {result.from} = {result.rate} {result.to}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {rates.map(rate => (
            <div key={rate.code} className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-xl font-bold">{rate.symbol}</p>
              <p className="text-sm opacity-75">{rate.code}</p>
              <p className="text-lg font-bold text-pink-400">{rate.rate.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurrencyExchange;
