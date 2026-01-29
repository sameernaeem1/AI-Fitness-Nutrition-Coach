import { useState, useEffect } from 'react';
import { workoutService } from '../services/workoutService'

export default function Calendar() {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());

    const getWorkoutForDay = (dayNumber) => {
        if (!dayNumber) return null;

        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(dayNumber).padStart(2, '0');

        const calendarDateString = `${year}-${month}-${day}`;

        return workouts.find(w => w.date === calendarDateString);
    }

    useEffect(() => {
        fetchWorkouts();
    }, []);

    const fetchWorkouts = async () => {
        try {
            setLoading(true);
            const data = await workoutService.getWorkouts();
            setWorkouts(data);
        } catch (err) {
            setError('Failed to load workouts');
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const days = [];
    const firstDay = getFirstDayOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);

    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    if (loading) return <div className="text-center text-gray-600">Loading...</div>;

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Workout Calendar</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={prevMonth} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded">←</button>
                    <h2 className="text-2xl font-bold">{monthName}</h2>
                    <button onClick={nextMonth} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded">→</button>
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-bold text-gray-600 py-2">
                            {day}
                        </div>
                    ))}

                    {days.map((day, idx) => {
                        const workout = getWorkoutForDay(day);

                        return (
                            <div
                                key={idx}
                                className={`border p-4 min-h-24 rounded transition-colors ${
                                    day ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-200'
                                }`}
                            >
                                {day && <div className="font-bold text-gray-800 mb-2">{day}</div>}

                                {day && workout && (
                                    <div className="text-xs bg-blue-500 text-white p-2 rounded shadow-sm cursor-pointer hover:bg-blue-600">
                                        Workout Plan
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}