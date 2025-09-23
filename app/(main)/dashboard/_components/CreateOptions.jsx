import { Phone, Video } from 'lucide-react'
import React from 'react'

const CreateOptions = () => {
  const options = [
    {
      icon: <Video className="p-3 text-blue-600 bg-blue-100 rounded-xl h-12 w-12" />,
      title: "Create New Interview",
      description:
        "Automate interview creation and scheduling using AI for candidate assessments.",
    },
    {
      icon: <Phone className="p-3 text-green-600 bg-green-100 rounded-xl h-12 w-12" />,
      title: "Create Phone Screening Call",
      description:
        "Automate phone screening and scheduling using AI for candidate evaluations.",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {options.map((item, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
        >
          <div className="mb-4">{item.icon}</div>
          <h2 className="font-semibold text-lg text-gray-800 mb-2">{item.title}</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  )
}

export default CreateOptions
