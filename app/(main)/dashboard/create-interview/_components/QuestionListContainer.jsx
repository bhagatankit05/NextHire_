import React from 'react'

const QuestionListContainer = ({ questions = [] }) => {
  return (
    <div>
      <h3 className='font-bold mb-2'>Generated Questions</h3>
          <div className='space-y-3'>
            {questions.map((q, idx)=> (
              <div key={idx} className='border border-gray-100 rounded-lg p-3'>
                <div className='font-medium'>{q.question || q.text || `Question ${idx+1}`}</div>
                {q.type && <div className='text-xs text-gray-500 mt-1'>{q.type}</div>}
              </div>
            ))}
          </div>
        </div>
    
  )
}

export default QuestionListContainer
