export default function WorkoutDetailModal({ workout, onClose }) {
    if (!workout) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Workout Plan for {new Date(workout.date).toLocaleDateString()}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">&times;</button>
                </div>

                <div className="space-y-4">
                    {workout.exercise_list.exercises.map((ex, index) => (
                        <div key={index} className="border-b pb-4 last:border-0">
                            <div className="flex justify-between font-bold text-lg text-blue-600">
                                <span>{ex.name}</span>
                                <span>{ex.sets} x {ex.reps}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                <span className="font-semibold">Rest:</span> {ex.suggested_rest_period} |
                                <span className="font-semibold ml-2">Suggested Weight:</span> {ex.suggested_weight}
                            </div>
                            {ex.notes && (
                                <p className="text-sm italic text-gray-500 mt-2 bg-gray-50 p-2 rounded border-l-2 border-gray-300">
                                    {ex.notes}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}