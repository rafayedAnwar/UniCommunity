import "../CSS/reviewPage.css"
import { useState, useEffect } from "react";


//import components:
import SearchBar from "../Components/Discussions/searchbar.js"
import ReviewBlock from "../Components/Reviews/Review_block.js"

const ReviewPage = () => {
    const [results, setResults] = useState([]);
    const [courseSelected, setCourseSelected] = useState(null)
    const [searchInput, setSearchInput] = useState("")
    const [currentUser, setCurrentUser] = useState(null)
    const [reviews, setReviews] = useState([])

    
    useEffect(() => {
        fetch("http://localhost:1760/api/users/current", { credentials: "include",})
        .then(res => res.json())
        .then(data => { if (data.user) setCurrentUser(data.user);} )
        .catch(err => console.error(err));
    }, []);
    
    useEffect(() => {
      if (!courseSelected) {
        fetch(`http://localhost:1760/api/reviews/all`)
          .then((res) => res.json())
          .then((data) => setReviews(Array.isArray(data) ? data : []))
          .catch((err) => console.error(err));
      } else {
        fetch(`http://localhost:1760/api/reviews/${courseSelected}`) .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) { setReviews(data); } 
            else if (data && !data.error) { setReviews([data]);} 
            else { setReviews([]); }
          }).catch((err) => console.error(err));}
    }, [courseSelected]);

  
    return (
        <div className="main-container">
            <div className="searchbar-container">
                <SearchBar setResults={setResults} input={searchInput} setInput={setSearchInput} />
                <div className="search-results">
                    {results.map((result,id) => {
                        return <div key={id} className="search-results-items" onClick=
                                    { () => {setCourseSelected(result.course_code); 
                                      setResults([]); setSearchInput("")}}>
                                    {result.course_code}
                                </div>})}
                </div>
            </div>
            <div>
                {reviews.length === 0 ? (
                    <p>No reviews yet for this course.</p>) 
                : (reviews.map((review) => (<ReviewBlock key={review._id} review={review} currentUser={currentUser} />)))}
            </div>            
        </div>
    );
} 

export default ReviewPage