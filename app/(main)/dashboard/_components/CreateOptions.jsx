import { Video, Sparkles } from 'lucide-react'
import React from 'react'

const CreateOptions = () => {
  return (
    // ⬇️ Reduced height here
    <div className="min-h-[40vh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Quote */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <p className="text-sm font-medium text-indigo-600">AI-Powered Hiring</p>
            </div>
            <blockquote className="text-3xl font-light text-gray-700 leading-relaxed">
              "The best way to predict the future is to <span className="text-indigo-600 font-medium">create it</span>."
            </blockquote>
            <p className="text-sm text-gray-400">— Peter Drucker</p>
          </div>

          {/* Right side - Create Interview Card */}
          <a
            href="/dashboard/create-interview"
            className="group block bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-indigo-200 relative overflow-hidden"
          >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative flex flex-col items-center text-center space-y-4">
              {/* Icon with animated background */}
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-indigo-500 to-blue-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Video className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Text content */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                  Create New Interview
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Automate interview creation and scheduling using AI for intelligent candidate assessments
                </p>
              </div>

              {/* Call to action hint */}
              <div className="pt-2 flex items-center gap-2 text-indigo-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Get Started</span>
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </a>
        </div>

        {/* Bottom accent */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">Click to begin your interview setup</p>
        </div>
      </div>
    </div>
  )
}

export default CreateOptions
