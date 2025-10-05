import { BriefcaseBusiness as BriefcaseBusinessIcon, CalendarHeart, Code as Code2Icon, FileText, GraduationCap, LayoutDashboard, List, Settings, User as User2Icon, UserCheck, WalletCards } from "lucide-react";

export const SideBarOptions = [
    {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: '/dashboard'
    },
    {
        name: "Scheduled Interviews",
        icon: CalendarHeart,
        path: '/scheduled-interviews'
    },
    {
        name: "All Interview",
        icon: List,
        path: '/all-interviews'
    },

    {
        name: "Billing",
        icon: WalletCards,
        path: '/billing'
    },
    {
        name: "Settings",
        icon: Settings,
        path: '/settings'
    },

]



export const InterviewTypes = [
  {
    title: "Technical Interview",
    icon: Code2Icon
  },
  {
    title: "Behavioral Interview",
    icon: User2Icon
  },
  {
    title: "Experienced Hire",
    icon: BriefcaseBusinessIcon
  },
  {
    title: "HR Interview",
    icon: UserCheck
  },

  {
    title: "Case Study Interview",
    icon: FileText
  },
  {
    title: "Campus Interview",
    icon: GraduationCap
  }
];
export const QUESTIONS_PROMPT=`You are an expert technical interviewer.
Based on the following inputs, generate a well-structured list of high-quality interview questions:
Job Title: {{jobTitle}}
Job Description/Resume: {{jobDescription}}
Interview Duration: {{duration}} minutes
Interview Type: {{type}}

📝 Your task:
- If the Job Description contains resume content, carefully analyze the candidate's skills, experience, projects, and qualifications
- Extract key technical skills, technologies, and experiences from the resume
- Generate targeted questions that probe deeper into the specific experiences and skills mentioned in the resume
- For candidates with strong backgrounds, create more advanced questions matching their level
- If no resume is provided, analyze the job description to identify key responsibilities and required skills
- Generate a list of interview questions based on interview duration (aim for approximately {{duration}}/5 questions)
- Adjust the number and depth of questions to match the interview duration
- Ensure the questions match the tone and structure of a real-life {{type}} interview

🌱 Format your response in JSON format with array list of questions.
format: interviewQuestions=[
  {
    question: "",
    type: "Technical/Behavioral/Experience/Problem Solving/Leadership"
  },
  ...
]

🎯 The goal is to create a structured, relevant, and time-optimized interview plan for a {{jobTitle}} role that aligns with the candidate's background if a resume is provided.`

export const FEEDBACK_PROMPT=`{{conversation}}

Depends on this Interview Conversation between assitant and user, 

Give me feedback for user interview. Give me rating out of 10 for technical Skills, 

Communication, Problem Solving, Experince. Also give me summery in 3 lines 

about the interview and one line to let me know whether is recommanded 

for hire or not with msg. Give me response in JSON format

{

    feedback:{

        rating:{

            techicalSkills:5,

            communication:6,

            problemSolving:4,

            experince:7

        },

        summery:<in 3 Line>,

        Recommendation:'',

        RecommendationMsg:''



    }

}

`
