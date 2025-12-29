import "../CSS/discussionPage.css";
import { useState, useEffect } from "react";

//importing components
import SearchBar from "../Components/Discussions/searchbar.js"
import CourseBlock from "../Components/Discussions/course_block.js"
import CreateDiscussion from "../Components/Discussions/create_discussion.js"
import DiscussionThreads from "../Components/Discussions/discussion_threads.js"


const DiscussionPage = () => {
    const [results, setResults] = useState([]);
    const [courseSelected, setCourseSelected] = useState(null)
    const [searchInput, setSearchInput] = useState("")
    const [currentUser, setCurrentUser] = useState(null)
    const [Threads, setThreads] = useState([])

    useEffect(() => {
        fetch("http://localhost:1760/api/users/current", {
            credentials: "include", 
        })
        .then(res => res.json())
        .then(data => {if (data.user) setCurrentUser(data.user); })
        .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (!courseSelected) return;

        fetch(`http://localhost:1760/api/discussions/${courseSelected}`)
            .then(result => result.json())
            .then(data => setThreads(data))
            .catch(err => console.error(err));
        }, [courseSelected]);

    return (
        <div className="main-container">
            <div className="searchbar-container">
                <SearchBar setResults={setResults} input={searchInput} setInput={setSearchInput} />
                <div className="search-results">
                    {results.map((result,id) => {
                        return <div key={id} className="search-results-items" onClick=
                                    {
                                        () => {setCourseSelected(result.course_code); 
                                        setResults([]);
                                        setSearchInput("")}
                                    }>
                                    {result.course_code}
                                </div>})}
                </div>
            </div>
            {courseSelected &&(
                <div>
                    <CourseBlock courseSelected={courseSelected}/>
                    <CreateDiscussion courseSelected={courseSelected} currentUser={currentUser} />
                    <div className="discussion-threads-container">
                            {Threads.map((thread) => (
                                <DiscussionThreads key={thread._id} thread={thread} currentUser={currentUser} />
                            ))}
                    </div>
                </div>
            )}            
             
        </div>
    );
}

export default DiscussionPage