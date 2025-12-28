
import React from 'react';
import { DaySchedule } from '../../../services/storage/settingsService';

interface OperatingHoursProps {
    schedule: DaySchedule[];
    onChange: (schedule: DaySchedule[]) => void;
}

export const OperatingHours: React.FC<OperatingHoursProps> = ({ schedule, onChange }) => {
    
    const handleToggleDay = (index: number) => {
        const newSchedule = [...schedule];
        newSchedule[index].isOpen = !newSchedule[index].isOpen;
        onChange(newSchedule);
    };

    const handleTimeChange = (index: number, field: 'openTime' | 'closeTime', value: string) => {
        const newSchedule = [...schedule];
        newSchedule[index][field] = value;
        onChange(newSchedule);
    };

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dia</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Abertura</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fechamento</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {schedule.map((day, idx) => (
                        <tr key={day.day} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-sm text-slate-700 dark:text-gray-300">{day.day}</td>
                            <td className="px-6 py-4 text-center">
                                <button 
                                    onClick={() => handleToggleDay(idx)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${day.isOpen ? 'bg-green-500' : 'bg-slate-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${day.isOpen ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </td>
                            <td className="px-6 py-4">
                                <input 
                                    type="time" 
                                    value={day.openTime}
                                    onChange={(e) => handleTimeChange(idx, 'openTime', e.target.value)}
                                    disabled={!day.isOpen}
                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 text-sm font-bold text-slate-900 dark:text-white disabled:opacity-50"
                                />
                            </td>
                            <td className="px-6 py-4">
                                <input 
                                    type="time" 
                                    value={day.closeTime}
                                    onChange={(e) => handleTimeChange(idx, 'closeTime', e.target.value)}
                                    disabled={!day.isOpen}
                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 text-sm font-bold text-slate-900 dark:text-white disabled:opacity-50"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
