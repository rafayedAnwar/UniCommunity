import './discussion_threads.css'
import {useState} from 'react';
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { FaCommentAlt } from "react-icons/fa";

import { ToastContainer, toast } from "react-toastify";


const DiscussionThreads = ({thread, currentUser}) => {

    const [likes, setLikes] = useState(thread.likes.length);
    const [dislikes, setDislikes] = useState(thread.dislikes.length);
    const [newcomment, setNewComments] = useState([]);
    const [commenting, setCommenting] = useState(false);
    
    const handleLike = async () => {
        if (!currentUser) { toast.error("Log in first to Like"); return}

        const response = await fetch(`http://localhost:1688/api/discussions/like/${thread._id}`, 
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

        const response = await fetch(`http://localhost:1688/api/discussions/dislike/${thread._id}`, 
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
            <p className="created-by">Created by: {currentUser.firstName} {currentUser.lastName}</p>
            <p className="header">{thread.header_text}</p>
            <p className="main">{thread.main_text}</p>
            <div className='interactives'>
                <p className="likes"><FaArrowTrendUp className="uptrend-icon" title='Stonks'  onClick={handleLike}/>  {likes}</p>
                <p className="dislikes"><FaArrowTrendDown className='downtrend-icon' title='notStonks' onClick={handleDislike}/>  {dislikes}</p>
                <p className="comments"><FaCommentAlt className='comment-icon' title='Comments' onClick={() => setCommenting(prev => !prev)}/>{thread.comments}</p>
                {commenting && (
                    <div className="all-thread-comments">
                        <div>Add Comment</div>
                        {thread.comments.length === 0 ? (
                        <p className="no-comments">No comments yet</p>):

                        (thread.comments.map((comment_item) => (
                            <div className="individual-comment" key={comment_item._id}>
                                {comment_item.text}
                            </div>))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default DiscussionThreads    