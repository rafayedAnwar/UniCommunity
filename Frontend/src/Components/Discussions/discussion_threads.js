import './discussion_threads.css'
import {useState, useEffect} from 'react';
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { FaCommentAlt } from "react-icons/fa";

import { ToastContainer, toast } from "react-toastify";

import Comment from "./comment";

const DiscussionThreads = ({thread, currentUser}) => {

  const [likes, setLikes] = useState(thread.likes?.length || 0);
  const [dislikes, setDislikes] = useState(thread.dislikes?.length || 0);
  const [commenting, setCommenting] = useState(false);
  const [commentsData, setCommentsData] = useState(thread.comments || []);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [profile, setProfile] = useState({ firstName: "", lastName: "", photo: null, })

    const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:1760/api/users/${thread.posted_by}`, {credentials: "include",});
      const data = await response.json();
      setProfile({
        firstName: data.firstName || "", lastName: data.lastName || "", photo: data.photo || "",
      });
    } catch (error) {console.error("Error fetching profile:", error);}
  }
    
    useEffect(() => { fetchProfile() }, [thread?.posted_by]);

    useEffect(() => {setCommentsData(thread.comments || []);}, [thread.comments]);

    useEffect(() => {
      setLikes(thread.likes?.length || 0);
      setDislikes(thread.dislikes?.length || 0);
    }, [thread.likes?.length, thread.dislikes?.length]);

    const handleCommentSubmit = async (event) => {
      event.preventDefault();
      if (!currentUser) { toast.error("Log in first to Comment"); return }
      const trimmedText = commentText.trim();
      if (!trimmedText) { toast.error("Comment cannot be empty"); return }

      setIsSubmittingComment(true);
      try {
        const response = await fetch(`http://localhost:1760/api/discussions/comment/${thread._id}`,
          {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser._id, content: trimmedText })
          });

        const updatedThread = await response.json();
        if (!response.ok) {throw new Error(updatedThread?.message || updatedThread?.error || 'Failed to add comment');}

        setCommentsData(updatedThread.comments || []);
        setCommentText("");
        toast.success("Comment added");

        await handleContributionUpdate();

      } catch (error) {toast.error(error.message || "Failed to add comment");
      } finally {setIsSubmittingComment(false);}
    };

    const handleContributionUpdate = async () => {
      if (!currentUser?._id) return;
      try {
        const response = await fetch(
          `http://localhost:1760/api/hof/thread_comment/${currentUser._id}`,
          { method: "PUT", credentials: "include" }
        );
        if (!response.ok) {console.error("Contribution update failed:", response.status);}
      } catch (error) {console.error("Contribution update error:", error);}
    };

    const handleLike = async () => {
        if (!currentUser) { toast.error("Log in first to Like"); return}

        const response = await fetch(`http://localhost:1760/api/discussions/like/${thread._id}`, 
            {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser._id })
            })
        if (response.ok) {
            const updatedThread = await response.json();
            setLikes(updatedThread.likes.length);
            setDislikes(updatedThread.dislikes.length);
        } else {toast.error("Failed to like discussion");}
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
        <ToastContainer newestOnTop limit={2} pauseOnHover={false} autoClose={2500} />
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
                <button type="button" className="comments" onClick={() => setCommenting(prev => !prev)}>
                    <FaCommentAlt className='comment-icon' title='Comments'/>
                    {commentsData.length}
                </button>
                {commenting && (
                  <div className="comments-container">
                    <form className="comment-form" onSubmit={handleCommentSubmit}>
                        <textarea
                          maxLength={500}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Share your thoughts (max 500 characters)"
                        />
                        <div className="comment-form-footer">
                            <span>{commentText.length}/500</span>
                            <button type="submit" className="comment-submit" disabled={!commentText.trim() || isSubmittingComment}> {isSubmittingComment ? 'Posting…' : 'Post Comment'}</button>
                        </div>
                    </form>
                    {commentsData && commentsData.length > 0 ? (
                      commentsData.map((comment_item, index) => (
                        <Comment key={comment_item._id || comment_item.createdAt || index} comment={comment_item}/>
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