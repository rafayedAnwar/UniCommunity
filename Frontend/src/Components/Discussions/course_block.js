import { useState, useEffect } from "react";
import "./courseblock.css";

const CourseBlock = ({ courseSelected }) => {
  const [currentCourseData, setCurrentCourseData] = useState(null);

  useEffect(() => {
    if (!courseSelected) return;

    fetch(`http://localhost:1760/api/courses/${courseSelected}`)
      .then((response) => response.json())
      .then((json) => {
        setCurrentCourseData(json);
      });
  }, [courseSelected]);

  if (!currentCourseData) return;

  return (
    <div className="course-block">
      <p className="code" title="Course Code">
        <span className="d">D:</span>
        {currentCourseData.course_code}
      </p>
      <p className="name" title="Course Title">{currentCourseData.course_name}</p>
      <p className="description">{currentCourseData.course_description}</p>
    </div>
  );
};

export default CourseBlock;
