"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InterviewTypes } from "@/services/Constant";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FormContainer = ({ onHandleInputChange, GoToNext }) => {
  const [interviewType, setInterviewType] = useState([]);

  useEffect(() => {
    onHandleInputChange("type", interviewType);
  }, [interviewType]);

  const toggleInterviewType = (type) => {
    setInterviewType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm space-y-6">
      {/* Job Position */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Job Position
        </label>
        <Input
          placeholder="e.g. Full Stack Developer"
          onChange={(e) => onHandleInputChange("jobPosition", e.target.value)}
        />
      </div>

      {/* Job Description */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Job Description
        </label>
        <Textarea
          placeholder="Enter detailed job description"
          className="h-[180px]"
          onChange={(e) => onHandleInputChange("jobDescription", e.target.value)}
        />
      </div>

      {/* Interview Duration */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Interview Duration
        </label>
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

      {/* Interview Type */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Interview Type
        </label>
        <div className="flex flex-wrap gap-3">
          {InterviewTypes.map((type, index) => {
            const isSelected = interviewType.includes(type.title);
            return (
              <div
                key={index}
                onClick={() => toggleInterviewType(type.title)}
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl border cursor-pointer transition ${
                  isSelected
                    ? "bg-blue-50 border-blue-300 text-blue-600"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <type.icon className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">{type.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={GoToNext} className="flex items-center gap-2">
          Generate Questions <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FormContainer;
