import { Button } from '@/components/ui/button'
import { Copy, Briefcase } from 'lucide-react'
import moment from 'moment'
import React from 'react'
import { toast } from 'sonner'
import ShareInterviewDialog from '@/components/ShareInterviewDialog'

const InterviewCard = ({ interview }) => {
    const url = `${process.env.NEXT_PUBLIC_HOST_URL}/${interview?.interview_id}`

    const copyLink = () => {
        navigator.clipboard.writeText(url)
        toast('Copied!')
    }

    return (
        <div className='p-5 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between h-full'>
            
            <div className='flex flex-col gap-1 mb-4'>
                <div className='flex items-center gap-2'>
                    <Briefcase className='h-4 w-4 text-primary' />
                    <h2 className='font-bold text-lg text-gray-800'>{interview?.jobPosition}</h2>
                </div>
                <p className='text-sm text-gray-600'>{interview?.duration} Min</p>
                <p className='text-xs text-gray-500 mt-1'>
                    {moment(interview?.created_at).format('DD MMM YYYY')}
                </p>
            </div>

            <div className='flex gap-3 mt-auto'>
                <Button
                    variant='outline'
                    className='flex-1 flex items-center justify-center gap-2'
                    onClick={copyLink}
                >
                    <Copy className='h-4 w-4' /> Copy Link
                </Button>
                <div className='flex-1'>
                    <ShareInterviewDialog interview={interview} />
                </div>
            </div>
        </div>
    )
}

export default InterviewCard
