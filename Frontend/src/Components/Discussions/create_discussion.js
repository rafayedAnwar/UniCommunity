import { useState } from "react";

//import icons:
import { BsFillArrowRightSquareFill } from "react-icons/bs";
import { RiArrowLeftDoubleFill } from "react-icons/ri";

//notify using toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//css imported to overrite toastify css
import "./creatediscussion.css";

const CreateDiscussion = ({courseSelected, currentUser}) => {
    const [header_text, setHeaderText] = useState("") //to store the header text
    const [main_text, setMainText] = useState("") //to store the main text
    const [writing, setWriting] = useState(false); //to toggle the input box
    
    //to make dynamic text areas
    const handleTextareaInput = (e) => {
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
    };
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!header_text || !main_text) {
            toast.error("Please fill in all fields");
            return;}

        const Discussion = { course_code: courseSelected, posted_by: currentUser._id, header_text, main_text}
        const postResponse = await fetch('http://localhost:1760/api/discussions/create', {
            method: 'POST',
            body: JSON.stringify(Discussion),
            headers: {'Content-Type': 'application/json'}
            })
        if (postResponse.ok) {
            toast.success("Discussion Posted!!")
            setHeaderText("");
            setMainText("");
            setWriting(false);
        } else {
            toast.error("Failed to post discussion");
            const errorData = await postResponse.json();
            console.log("Error details:", errorData);
            setWriting(false);
        }    
    }

    return (
        <div className="discussion-container">
                {!writing && 
                    <div className="expand-text-container" onClick={() => setWriting(true)}>
                        <div className="expand-text">Create a New Discussion</div>
                            <BsFillArrowRightSquareFill title="Expand" className="expand-button" />
                        </div>
                }
                {writing && <RiArrowLeftDoubleFill className="close-button" title="Cancel" onClick={() => setWriting(false)}/>}
            {writing && (
            <form className="discussion-form" onSubmit={handleSubmit}>
                <textarea type="text" placeholder="Title: " 
                             className="header-input" 
                             onChange={(e)=>{setHeaderText(e.target.value)}}
                             onInput={handleTextareaInput} 
                             value={header_text}
                             rows={1}/>
                <textarea type="text" placeholder="Discussion body: " 
                             className="main-input"
                             onChange={(e)=>{setMainText(e.target.value)}}
                             onInput={handleTextareaInput}
                             value={main_text}
                             rows={3}/>
                <div className="post-cancel"><button type="submit" 
                             className="submit-button">Post Discussion
                            </button> 
                            <button className="cancel-button" title="Cancel" onClick={() => setWriting(false)}>Cancel</button></div>
            </form>)}

      <ToastContainer
        position="top-right"
        autoClose={3000} // closes after 3 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default CreateDiscussion;
