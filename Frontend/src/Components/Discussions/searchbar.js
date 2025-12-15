import { IoSearchCircleSharp } from "react-icons/io5";
import React, { useState } from "react";
import "./searchbar.css";

const SearchBar = ({ setResults, input, setInput }) => {
  //const [input, setInput] = useState("");

  const fetchData = (value) => {
    fetch(`http://localhost:1760/api/courses/getall`)
      .then((response) => response.json())
      .then((json) => {
        const results = json.filter((course) => {
          return (
            value &&
            course.course_code.toLowerCase().includes(value.toLowerCase())
          );
        });
        setResults(results);
      });
  };
  const handleChange = (value) => {
    setInput(value);
    fetchData(value);
  };

  return (
    <div className="search-bar" title="Search">
      <IoSearchCircleSharp className="search-icon" />
      <input
        title="Search"
        placeholder="e.g. CSE471"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
