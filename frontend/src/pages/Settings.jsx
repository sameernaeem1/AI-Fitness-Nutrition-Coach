import { useState } from 'react';
import UpdateProfile from '../components/profile/UpdateProfile';
import SelectEquipment from '../components/profile/SelectEquipment';
import SelectInjuries from '../components/profile/SelectInjuries';

export default function Settings() {
    const [view, setView] = useState('profile');

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-64 flex flex-col gap-2">
                <button 
                    onClick={() => setView('profile')}
                    className={`text-left px-4 py-2 rounded-lg ${view === 'profile' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
                >
                    Update Profile
                </button>
                <button 
                    onClick={() => setView('equipment')}
                    className={`text-left px-4 py-2 rounded-lg ${view === 'equipment' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
                >
                    Update Equipment
                </button>
                <button 
                    onClick={() => setView('injuries')}
                    className={`text-left px-4 py-2 rounded-lg ${view === 'injuries' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
                >
                    Update Injuries
                </button>
            </div>

            <div className="flex-1">
                {view === 'profile' && <UpdateProfile />}
                {view === 'equipment' && <SelectEquipment />}
                {view === 'injuries' && <SelectInjuries />}
            </div>
        </div>
    );
}