import { useEffect, useState } from 'react';
import './comment.css';

const Comment = ({ comment }) => {
	const [profile, setProfile] = useState({ firstName: '', lastName: '', photo: '' });

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const response = await fetch(`http://localhost:1760/api/users/${comment.commented_by}`, {credentials: 'include'});
				if (!response.ok) {throw new Error('Failed to fetch commenter');}
				const data = await response.json();
				setProfile({firstName: data.firstName || '', lastName: data.lastName || '', photo: data.photo || '',});
			} catch (error) {console.error('Error fetching commenter profile:', error);}
		};

		if (comment?.commented_by) {
			fetchProfile();
		}
	}, [comment?.commented_by]);

	if (!comment) {return null;}

	const fullName = `${profile.firstName} ${profile.lastName}`.trim() || 'User';
	const avatarFallback = `https://ui-avatars.com/api/?name=${profile.firstName || 'User'}`;
	const avatarSrc = profile.photo && profile.photo.trim() !== '' ? profile.photo : avatarFallback;
	const readableDate = comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : '';
	const content = comment.content || '';

	return (
		<div className="comment-card">
			<img
				src={avatarSrc} alt={fullName} className="comment-avatar" referrerPolicy="no-referrer"
				onError={(event) => {event.target.onerror = null; event.target.src = avatarFallback;}}/>
			<div className="comment-body">
				<p className="comment-text">{content}</p>
				<div className="comment-meta">
					<span className="comment-author">{fullName}</span>
					{readableDate && <span className="comment-date">{readableDate}</span>}
				</div>
			</div>
		</div>
	);
};

export default Comment;
