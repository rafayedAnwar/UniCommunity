
import React from "react";
import { Link } from "react-router-dom";
import "../CSS/discussionPage.css";
import Icon from "../Assets/icon.png";

//importing components
import SearchBar from "../Components/Discussions/searchbar.js"
import CourseBlock from "../Components/Discussions/course_block.js"
import CreateDiscussion from "../Components/Discussions/create_discussion.js"


//importing icons from react-icons library
import { FaUser } from "react-icons/fa";
import { HiOutlineLogout } from "react-icons/hi"

const DiscussionPage = () => {
    {/*for dynamic search bar*/}
    const [results, setResults] = React.useState([]);
    {/*for suggestion click setup*/}
    const [courseSelected, setCourseSelected] = React.useState(null)
    const [searchInput, setSearchInput] = React.useState(""); {/*new*/} 

    return (
        <div className="Main-Container">
            <div className="header-block">
                <div className="icon-container">
                    <Link to="/discussion"><img src={Icon} alt="Icon" className="icon" /></Link>
                </div>
                <div className="header-text"><h1>Search for Discussions</h1></div>
                <Link to="/profile" className="profile-link"><FaUser className="profile-icon" title="Profile"/></Link>
                <Link to="/" className="logout-link"><HiOutlineLogout className="logout-icon" title="Logout"/></Link>
            </div>
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
                <CreateDiscussion courseSelected={courseSelected}/>
                </div>
            )}            
             
        </div>
    );
}

export default DiscussionPage 