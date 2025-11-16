
import React from 'react';
import { CheckIcon } from './Icons';

interface PipelineStepProps {
  stepNumber: number;
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCompleted: boolean;
  children: React.ReactNode;
}

export const PipelineStep: React.FC<PipelineStepProps> = ({ stepNumber, title, icon, isActive, isCompleted, children }) => {
  const baseClasses = "flex items-center justify-center w-12 h-12 rounded-full border-2";
  const statusClasses = isActive 
    ? (isCompleted ? "bg-green-500 border-green-400" : "bg-indigo-600 border-indigo-500") 
    : "bg-gray-700 border-gray-600";
  
  const titleClasses = isActive ? "text-white" : "text-gray-500";
  const lineClasses = "flex-auto border-t-2 " + (isCompleted ? "border-indigo-500" : "border-gray-700");


  return (
    <div className={`transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
        <div className="flex items-center mb-4">
            <div className={`${baseClasses} ${statusClasses}`}>
                {isCompleted ? <CheckIcon className="w-6 h-6 text-white"/> : icon}
            </div>
            <div className={lineClasses}></div>
        </div>
        <div className="pl-4">
            <h2 className={`text-xl font-bold mb-4 ${titleClasses}`}>{stepNumber}. {title}</h2>
            <div className={!isActive ? 'pointer-events-none' : ''}>
                {children}
            </div>
        </div>
    </div>
  );
};
