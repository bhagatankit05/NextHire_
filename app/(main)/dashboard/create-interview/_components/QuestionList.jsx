import axios from 'axios';
import { Loader2Icon } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

const QuestionList = ({ formData }) => {

    const [loading, setLoading] = useState(false);
    useEffect(()=>{
        if (formData) {
            GenerateQuestionList();
        }
    },[formData])

    const GenerateQuestionList=async ()=>{
        setLoading(true);
        try{
        const result = await axios.post('/api/ai-model',{...formData});

        console.log(result.data);
        setLoading(false);
        }catch(error){
          toast('Server Error, Try Again Later!');
          setLoading(false);
        }
    }
  return (
    <div>
      {loading && 
      <div className='p-5 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3'>
        <Loader2Icon className='animate-spin'/>
        <div>
          <h2>Generating Interview Questions...</h2>
          <p>Our AI is Crafting questions bases on your job position</p>
        </div>
        </div>}
    </div>
  )
}

export default QuestionList
