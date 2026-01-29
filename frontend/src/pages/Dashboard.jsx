import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import WorkoutPlan from './WorkoutPlan';
import Calendar from './Calendar';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage,getItem('lastTab') || 'plan';
    });

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        localStorage.setItem('lastTab', tab);
    };

    return (
        <div className="flex h-screen">
            <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
            <div className="flex-1 bg-gray-100 overflow-auto">
                <div className="p-8">
                    {activeTab === 'plan' && <WorkoutPlan setActiveTab={setActiveTab} />}
                    {activeTab === 'calendar' && <Calendar />}
                </div>
            </div>
        </div>
    );
}