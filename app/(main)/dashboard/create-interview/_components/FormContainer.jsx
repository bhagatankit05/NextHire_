import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import React, { use, useEffect, useState } from 'react'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { InterviewTypes } from '@/services/Constant'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { set } from 'mongoose'

const FormContainer = ({ onHandleInputChange , GoToNext }) => {

    const [interviewType, setInterviewType] = useState([]);

    useEffect(() => {
        if (interviewType) {
            onHandleInputChange('type', interviewType);
        }
    }, [interviewType]);

    const AddInterviewType=(type) => {
        const exists = interviewType.includes(type);
        if(!exists){
            setInterviewType(prev => [...prev, type]);
        }else{
            setInterviewType(prev => prev.filter(item => item !== type));
        }
    }

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm">
            {/* Job Position */}
            <div>
                <h2 className="text-sm font-medium text-gray-700">Job Position</h2>
                <Input
                    placeholder="e.g. Full Stack Developer"
                    className="mt-2"
                    onChange={(event) => onHandleInputChange("jobPosition", event.target.value)}
                />
            </div>

            {/* Job Description */}
            <div className="mt-5">
                <h2 className="text-sm font-medium text-gray-700">Job Description</h2>
                <Textarea
                    placeholder="Enter detailed job description"
                    className="h-[200px] mt-2"
                    onChange={(event) => onHandleInputChange("jobDescription", event.target.value)}
                />
            </div>

            {/* Interview Duration */}
            <div className="mt-5">
                <h2 className="text-sm font-medium text-gray-700">Interview Duration</h2>
                <Select onValueChange={(value) => onHandleInputChange("duration", value)}>
                    <SelectTrigger className="w-[180px] mt-2">
                        <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5 Min</SelectItem>
                        <SelectItem value="15">15 Min</SelectItem>
                        <SelectItem value="30">30 Min</SelectItem>
                        <SelectItem value="45">45 Min</SelectItem>
                        <SelectItem value="60">60 Min</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="mt-5">
                <h2 className="text-sm font-medium text-gray-700">Interview Type</h2>
                <div className='flex flex-wrap gap-3 mt-2'>
                    {InterviewTypes.map((type, index) => (
                        <div key={index} className={`flex  gap-2 mt-3 items-center cursor-pointer border border-gray-200 bg-white rounded-2xl p-1 hover:bg-secondary ${interviewType.includes(type.title) && 'bg-blue-50 text-primary'}`}
                            onClick={() => AddInterviewType(type.title)}>
                            <type.icon className='h-6 w-6 text-gray-600' />
                            <span>{type.title} </span>
                        </div>
                    ))}
                </div>

            </div>
            <div className='mt-7 flex justify-end' onClick={()=>GoToNext()}>
                <Button >Generate Questions <ArrowRight /></Button>
            </div>
        </div>
    )
}

export default FormContainer
