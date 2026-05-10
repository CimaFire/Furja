import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const GamesPage = () => {
  const { user } = useSelector(state => state.auth);
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [betAmount, setBetAmount] = useState(1);

  useEffect(() => {
    fetchGames();
    fetchLeaderboard();
    if (user) fetchUserStats();
  }, [user]);

  const fetchGames = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/games');
      setGames(response.data);
    } catch (error) {
      console.error('Failed to fetch games');
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/games/leaderboard');
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard');
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/games/user/${user.id}/stats`
      );
      setUserStats(response.data);
    } catch (error) {
      console.error('Failed to fetch user stats');
    }
  };

  const playGame = async (game) => {
    if (betAmount < game.min_bet || betAmount > game.max_bet) {
      alert(`الرهان يجب أن يكون بين ${game.min_bet} و ${game.max_bet}`);
      return;
    }

    try {
      // Simulate game result
      const isWin = Math.random() > 0.5;
      const winAmount = isWin ? betAmount * game.win_multiplier : 0;

      await axios.post(
        'http://localhost:5000/api/games/end',
        {
          sessionId: Math.random(),
          result: isWin ? 'win' : 'lost',
          winAmount: winAmount
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      alert(isWin ? `فزت! 🎉 ${winAmount}` : 'خسرت! حاول مرة أخرى');
      fetchUserStats();
    } catch (error) {
      alert('فشل اللعبة');
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🎮 الألعاب والرهانات</h1>

        {user && userStats && (
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 rounded-lg mb-8">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm opacity-75">إجمالي الألعاب</p>
                <p className="text-3xl font-bold">{userStats.total_games}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">الفوز</p>
                <p className="text-3xl font-bold text-green-300">{userStats.won_games}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">الخسارة</p>
                <p className="text-3xl font-bold text-red-300">{userStats.lost_games}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">العائد الكلي</p>
                <p className="text-3xl font-bold text-yellow-300">
                  ${userStats.total_winnings?.toFixed(2) || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Games */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">الألعاب المتاحة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {games.map(game => (
                <div key={game.id} className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 cursor-pointer"
                  onClick={() => setSelectedGame(game)}>
                  <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                  <p className="text-sm opacity-75 mb-4">{game.description}</p>
                  <div className="flex justify-between text-sm">
                    <span>الحد الأدنى: ${game.min_bet}</span>
                    <span>الضارب: {game.win_multiplier}x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <h2 className="text-2xl font-bold mb-4">🏆 لوحة الصدارة</h2>
            <div className="bg-gray-800 p-4 rounded-lg">
              {leaderboard.slice(0, 10).map((player, index) => (
                <div key={player.id} className="flex justify-between items-center mb-3 pb-3 border-b border-gray-700">
                  <div>
                    <p className="font-bold">#{index + 1} {player.username}</p>
                    <p className="text-sm opacity-75">{player.total_games} لعبة</p>
                  </div>
                  <p className="text-lg font-bold text-yellow-300">${player.total_winnings?.toFixed(0) || 0}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Game Modal */}
        {selectedGame && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">{selectedGame.name}</h2>
              <p className="text-gray-300 mb-6">{selectedGame.rules}</p>
              
              <div className="mb-6">
                <label className="block mb-2">مبلغ الرهان</label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                  min={selectedGame.min_bet}
                  max={selectedGame.max_bet}
                  className="w-full bg-gray-700 text-white p-2 rounded"
                />
                <p className="text-sm opacity-75 mt-2">
                  {selectedGame.min_bet} - {selectedGame.max_bet}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => playGame(selectedGame)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded"
                >
                  العب الآن 🎯
                </button>
                <button
                  onClick={() => setSelectedGame(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamesPage;
