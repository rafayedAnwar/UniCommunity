import './discussion_threads.css'
import {useState, useEffect} from 'react';
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { FaCommentAlt } from "react-icons/fa";

import { ToastContainer, toast } from "react-toastify";

import TextReview from "../Reviews/text_review.js"

const DiscussionThreads = ({thread, currentUser}) => {

    const [likes, setLikes] = useState(thread.likes?.length || 0);
    const [dislikes, setDislikes] = useState(thread.dislikes?.length || 0);
    const [newcomment, setNewComments] = useState([]);
    const [commenting, setCommenting] = useState(false);
    const [profile, setProfile] = useState({ firstName: "", lastName: "", photo: null, })

    const fetchProfile = async () => {
    try {
      const response = await fetch(
        `http://localhost:1760/api/users/${thread.posted_by}`,
        {credentials: "include",}
      );
      const data = await response.json();
      setProfile({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        photo: data.photo || "",
      });
    } catch (error) {console.error("Error fetching profile:", error);}
    }
    
    useEffect(() => {
         fetchProfile()
      }, [thread?.posted_by]);


    const handleLike = async () => {
        if (!currentUser) { toast.error("Log in first to Like"); return}

        const response = await fetch(`http://localhost:1760/api/discussions/like/${thread._id}`, 
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser._id })
            })
        if (response.ok) {
            const updatedThread = await response.json();
            setLikes(updatedThread.likes.length);
            setDislikes(updatedThread.dislikes.length);
        } else {
            toast.error("Failed to like discussion");
        }
    }

    const handleDislike = async () => {
        if (!currentUser) { toast.error("Log in first to Dislike"); return}

        const response = await fetch(`http://localhost:1760/api/discussions/dislike/${thread._id}`, 
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser._id })
            })
        if (response.ok) {
            const updatedThread = await response.json();
            setLikes(updatedThread.likes.length);
            setDislikes(updatedThread.dislikes.length);
        } else {
            toast.error("Failed to like discussion");
        }
    }

    return (
        <div className="thread-block">
            <p className="created-by"><img
            src={profile.photo && profile.photo.trim() !== "" ? profile.photo : `https://ui-avatars.com/api/?name=${profile.firstName}`}
            alt={profile.firstName}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${profile.firstName}`;
            }}
            style={{ width: 50,height: 50, borderRadius: "30%", marginRight: 5, marginBottom: 5, objectFit: "cover",}}/> 
            {profile.firstName} {profile.lastName}</p>
            <p className="header">{thread.header_text}</p>
            <p className="main">{thread.main_text}</p>
            <div className='interactives'>
                <p className="likes"><FaArrowTrendUp className="uptrend-icon" title='Stonks'  onClick={handleLike}/>  {likes}</p>
                <p className="dislikes"><FaArrowTrendDown className='downtrend-icon' title='notStonks' onClick={handleDislike}/>  {dislikes}</p>
                <p className="comments"><FaCommentAlt className='comment-icon' title='Comments' onClick={() => setCommenting(prev => !prev)}/>{thread.comments}</p>
                {commenting && (
                  <div className="comments-container">
                    {thread.comments && thread.comments.length > 0 ? (
                      thread.comments.map((comment_item) => (
                        <TextReview key={comment_item._id} written={comment_item}/>
                      ))
                    ) : (
                      <p className="no-reviews">No Comments yet.</p>
                    )}
                  </div>
                )}
            </div>
        </div>
    )
}

export default DiscussionThreads    