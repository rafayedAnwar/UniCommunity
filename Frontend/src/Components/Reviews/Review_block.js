import './review_block.css'
import { IoChevronDownCircle } from "react-icons/io5";
import { IoIosAddCircle } from "react-icons/io";
//notify using toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import TextReview from "./text_review.js"


//for radar chart
import React, { useState } from 'react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend} from 'chart.js';
import { Radar } from 'react-chartjs-2';
ChartJS.register( RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);





const ReviewBlock = ({review, currentUser}) => {
    const [comment, setComment] = useState(false)
    const [reviewing, setReviewing] = useState(false)

    //for review form
    const [ratings, setRatings] = useState({ theory: 0, lab: 0, assignment: 0, project: 0, resources: 0,});
    const [textReview, setTextReview] = useState('');

    //for radar chart
    const data = 
      {labels: ['Theory', 'Lab', 'Assignment', 'Project', 'Resources'],
        datasets: [{label: 'Course Overview',
            data: [review.theory_total/review.reviewCount, review.lab_total/review.reviewCount, review.assignment_total/review.reviewCount, review.project_total/review.reviewCount, review.resources_total/review.reviewCount],
            backgroundColor: 'rgba(	0, 102, 204, 0.2)', borderColor: 'rgb(0, 128, 255)', borderWidth: 1,},],}
    const options = {
      scales: {r: {min: 0,max: 5, ticks: {stepSize: 1,},},},
      plugins: {legend: {display: false, position: 'top',},
      tooltip: {enabled: true,},},}
    
    //for review form
    const RatingInput = ({ label, value, onChange }) => {
      return (
        <div className="rating-row">
          <p>{label}</p>
          <div className="rating-buttons">
            {[1, 2, 3, 4, 5].map(num => (
              <button key={num} type="button" className={`rating-btn ${value === num ? 'active' : ''}`} onClick={() => onChange(num)}>
                {num}
              </button>))}
          </div>
        </div>
      );};
    
    const handleSubmit = async (e) => {
      e.preventDefault()
      if (!ratings.theory || !ratings.lab || !ratings.assignment || !ratings.project || !ratings.resources) {
        toast.error("Please rate all categories before submitting");
        return;}
      
        const payload = { courseId: review.courseId, theory: ratings.theory, lab: ratings.lab, assignment: ratings.assignment, project: ratings.project, resources: ratings.resources, written_review: textReview,};

      try {
        const res = await fetch('http://localhost:1760/api/reviews', {
          method: 'POST',
          headers: {'Content-Type': 'application/json',},
          credentials: 'include',
          body: JSON.stringify(payload),});

        const data = await res.json();

        if (!res.ok) { toast.error(data.error || 'Failed to submit review'); throw new Error(data.error || 'Failed to submit review');}
        
          //success:
          toast.success("Review posted successfully!");

          await handleContributionUpdate();
          
        // reset UI
        setReviewing(false); setTextReview(''); setRatings({ theory: 0, lab: 0, assignment: 0, project: 0, resources: 0, });
      } catch (err) { console.error(err.message);}
    };

    const handleContributionUpdate = async () => {
      if (!currentUser?._id) return;
      try {
        const response = await fetch(
          `http://localhost:1760/api/hof/review/${currentUser._id}`,
          { method: "PUT", credentials: "include" }
        );
        if (!response.ok) {console.error("Contribution update failed:", response.status);}
      } catch (error) {console.error("Contribution update error:", error);}
    };

    //main return
    return (
        <div className='main-container'>
            <div className='each-box'>
                <div className='course-info'>
                    <div className='course-code' title='Course Code'>{review.courseId}</div>
                    <div className='title' title='Course Title'>{review.courseTitle}</div>
                    <button
                      type="button"
                      className={`add-review ${reviewing ? 'is-active' : ''}`}
                      onClick={() => {setReviewing(prev => !prev); setComment(false);}} aria-pressed={reviewing}
                    >
                      Add Your Review <IoIosAddCircle className='plus'/>
                    </button>
                    <button
                      type="button"
                      className={`view-review ${comment ? 'is-active' : ''}`}
                      onClick={() => {setComment(prev => !prev); setReviewing(false)}}
                      aria-pressed={comment}
                    >
                      See Individual Reviews <IoChevronDownCircle className='down' />
                    </button>
                </div>
                <Radar data={data} options={options} className='radar'/>
            </div>
            {(reviewing || comment) && (
              <div className='review-extend'>
                {reviewing && (
                  <form className='review-form' onSubmit={handleSubmit}>
                    <RatingInput label="Rate Theory difficulty:" value={ratings.theory} onChange={(val) => setRatings(prev => ({ ...prev, theory: val }))} />
                    <RatingInput label="Rate Lab difficulty:" value={ratings.lab} onChange={(val) => setRatings(prev => ({ ...prev, lab: val }))} />
                    <RatingInput label="Rate Assignment difficulty:" value={ratings.assignment} onChange={(val) => setRatings(prev => ({ ...prev, assignment: val }))} />
                    <RatingInput label="Rate Project difficulty:" value={ratings.project} onChange={(val) => setRatings(prev => ({ ...prev, project: val }))} />
                    <RatingInput label="Rate Resource Availability:" value={ratings.resources} onChange={(val) => setRatings(prev => ({ ...prev, resources: val }))} />
                    <textarea className='text-box' placeholder='Describe your course experience/opinion:' value={textReview} onChange={(e) => setTextReview(e.target.value)}/>
                    <button type="submit" className="submit-review"> Submit Review</button>
                  </form>
                )}
                {comment && (
                  <div className="written-reviews-container">
                    {review.writtenReviews && review.writtenReviews.length > 0 ? (
                      review.writtenReviews.map((writtenReview, index) => (
                        <TextReview key={index} written={writtenReview}/>
                      ))
                    ) : (
                      <p className="no-reviews">No written reviews yet.</p>
                    )}
                  </div>
                )}
              </div>
            )}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover/>  
        </div>
      )
}
export default ReviewBlock