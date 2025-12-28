import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Button from '../components/Button';
import SEO from '../components/SEO';

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        API.get('/users/leaderboard')
            .then(res => setLeaders(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="min-h-screen bg-[#f7f7f7] font-arcade flex flex-col items-center p-8 text-[#535353]">
            <SEO
                title="Leaderboard - Dino Runner"
                description="Check the top scores and compete for #1!"
            />
            <h1 className="text-3xl md:text-4xl mb-12 tracking-widest text-[#535353] border-b-4 border-[#535353] pb-4">TOP RUNNERS</h1>

            {!user && (
                <div className="mb-8 p-3 bg-yellow-100 border-2 border-yellow-500 text-yellow-800 text-xs md:text-sm text-center w-full max-w-lg">
                    <p>
                        <Link to="/login" className="font-bold underline hover:text-yellow-900">LOG IN</Link> TO SEE YOUR RANK
                    </p>
                </div>
            )}

            <div className="w-full max-w-2xl bg-white border-4 border-[#535353] p-2 shadow-[8px_8px_0px_0px_rgba(83,83,83,1)] mb-12 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[300px]">
                    <thead className="bg-[#535353] text-white">
                        <tr>
                            <th className="p-2 md:p-4 text-xs md:text-sm uppercase tracking-wider w-12 text-center">Rank</th>
                            <th className="p-2 md:p-4 text-xs md:text-sm uppercase tracking-wider">Player</th>
                            <th className="p-2 md:p-4 text-right text-xs md:text-sm uppercase tracking-wider">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaders.length > 0 ? leaders.map((player, index) => {
                            const isCurrentUser = user && (player._id === user._id || player.email === user.email);
                            return (
                                <tr
                                    key={player._id}
                                    className={`
                                        border-b-2 border-[#535353] transition-colors duration-200
                                        ${isCurrentUser ? "bg-yellow-100 animate-pulse" : "hover:bg-gray-100"}
                                    `}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <td className="p-2 md:p-4 font-bold text-center relative">
                                        {index === 0 && <span className="absolute left-1 top-1/2 -translate-y-1/2 text-lg">🥇</span>}
                                        {index === 1 && <span className="absolute left-1 top-1/2 -translate-y-1/2 text-lg">🥈</span>}
                                        {index === 2 && <span className="absolute left-1 top-1/2 -translate-y-1/2 text-lg">🥉</span>}
                                        {index + 1}
                                    </td>
                                    <td className="p-2 md:p-4">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="w-6 h-6 md:w-8 md:h-8 bg-[#535353] overflow-hidden flex flex-shrink-0 items-center justify-center border-2 border-[#535353]">
                                                <div className="w-3 h-3 md:w-4 md:h-4 bg-white"></div>
                                            </div>
                                            <span
                                                className={`text-xs md:text-sm uppercase truncate max-w-[100px] md:max-w-[200px] ${isCurrentUser ? "font-bold" : ""}`}
                                                title={player.username}
                                            >
                                                {player.username || "Unknown"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-2 md:p-4 text-right font-bold text-xs md:text-sm">
                                        {player.highScore.toString().padStart(5, '0')}
                                    </td>
                                </tr>
                            );
                        }) : (
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
