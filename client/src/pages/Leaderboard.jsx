import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Button from '../components/Button';

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        API.get('/users/leaderboard')
            .then(res => setLeaders(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="min-h-screen bg-[#f7f7f7] font-arcade flex flex-col items-center p-8 text-[#535353]">
            <h1 className="text-3xl md:text-4xl mb-12 tracking-widest text-[#535353] border-b-4 border-[#535353] pb-4">TOP RUNNERS</h1>

            <div className="w-full max-w-2xl bg-white border-4 border-[#535353] p-2 shadow-[8px_8px_0px_0px_rgba(83,83,83,1)] mb-12">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#535353] text-white">
                        <tr>
                            <th className="p-4 text-xs md:text-sm uppercase tracking-wider">Rank</th>
                            <th className="p-4 text-xs md:text-sm uppercase tracking-wider">Player</th>
                            <th className="p-4 text-right text-xs md:text-sm uppercase tracking-wider">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaders.length > 0 ? leaders.map((player, index) => (
                            <tr key={player._id} className="border-b-2 border-[#535353] hover:bg-gray-100 transition-none">
                                <td className="p-4 font-bold flex items-center">
                                    {index === 0 && <span className="mr-2 text-yellow-500">★</span>}
                                    {index + 1}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#535353] overflow-hidden flex flex-shrink-0 items-center justify-center border-2 border-[#535353]">
                                            {/* Simple pixel avatar placeholder */}
                                            <div className="w-4 h-4 bg-white"></div>
                                        </div>
                                        <span className="text-xs md:text-sm uppercase truncate max-w-[120px] md:max-w-[200px]" title={player.username}>{player.username}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-right font-bold text-xs md:text-sm">
                                    {player.highScore.toString().padStart(5, '0')}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="3" className="p-8 text-center text-xs uppercase animate-pulse">Waiting for challenger...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
                <Button onClick={() => navigate('/game')} variant="primary" className="border-4">PLAY AGAIN</Button>
                <Button onClick={() => navigate('/character-select')} variant="secondary" className="border-4">CHARACTERS</Button>
            </div>
        </div>
    );
}
