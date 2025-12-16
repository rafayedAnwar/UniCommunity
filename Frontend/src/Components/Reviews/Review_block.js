import './review_block.css'
import { IoChevronDownCircle } from "react-icons/io5";
import { IoIosAddCircle } from "react-icons/io";
//for radar chart
import React from 'react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend} from 'chart.js';
import { Radar } from 'react-chartjs-2';
ChartJS.register( RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);



const ReviewBlock = ({review, currentUser}) => {
    const data = 
    {
        labels: ['Theory', 'Lab', 'Assignment', 'Project', 'Resources'],
        datasets: [
        {
            label: 'Course Overview',
            data: [review.theory_mem_total, 
                review.lab_difficulty_total,
                review.assignment_difficulty_total, 
                review.project_difficulty_total, 
                review.resources_availability_total],
            backgroundColor: 'rgba(49, 200, 49, 0.2)',
            borderColor: 'rgb(152, 255, 152)',
            borderWidth: 1,
        },
        ],
    }

      const options = {
    scales: {
      r: {
        min: 0,
        max: 5,           // fixes the range
        ticks: {
          stepSize: 1,  // optional, controls tick spacing
        },
      },
    },
    plugins: {
      legend: {
        display: false,
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
  };

    return (
        <div className='main-container'>
            <div className='each-box'>
                <div className='course-info'>
                    <div className='course-code' title='Course Code'>{review.courseId}</div>
                    <div className='title' title='Course Title'>{review.courseTitle}</div>
                    <div className='add-review'>Add Review <IoIosAddCircle className='plus'/></div>
                    <div className='view-review'>See Individual <IoChevronDownCircle className='down' /></div>
                </div>
                <Radar data={data} options={options} className='radar'/>
            </div>

            
        </div>
)
}
export default ReviewBlock


