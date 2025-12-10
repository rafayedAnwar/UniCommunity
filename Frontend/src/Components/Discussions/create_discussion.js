import { useState } from "react";   
import "./creatediscussion.css"

//import icons:
import { BsFillArrowRightSquareFill } from "react-icons/bs"
import { RxCross2 } from "react-icons/rx"

const CreateDiscussion = ({courseSelected}) => {

    const [posted_by, setPostedby] = useState("6576859403a2b1c0d9e8f7a6") //to store who posted the discussion, the current value is demo for testing
    const [header_text, setHeaderText] = useState("") //to store the header text
    const [main_text, setMainText] = useState("") //to store the main text
    const [writing, setWriting] = useState(false); //to toggle the input box
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        const Discussion = { courseSelected, posted_by, header_text, main_text}
        const postResponse = await fetch('/api/discussions/create', {
            method: 'POST',
            body: JSON.stringify(Discussion),
            headers: {'Content-Type': 'application/json'}
            })
        if (postResponse.ok) {
            console.log("Discussion Posted Successfully");
            setPostedby("");
            setHeaderText("");
            setMainText("");
        } else {console.log("Failed to post discussion");}    
        }


    return (
        <div className="discussion-container">
            <form className={`discussion-form ${writing ? "centered" : ""}`} onSubmit={handleSubmit}>
                <input placeholder="Create a new Discussion"
                       className="header-input"
                       onChange={(e)=>{setHeaderText(e.target.value)}}
                       value={header_text}/>
                {!writing && <BsFillArrowRightSquareFill title="Expand" className="expand-button" onClick={() => setWriting(true)}/>}
                {writing && <RxCross2 className="expand-button" title="Cancel" onClick={() => setWriting(false)}/>}
                {writing && <input type="text" 
                             placeholder="Create a new Discussion" 
                             className="main-input"
                             onChange={(e)=>{setMainText(e.target.value)}}
                             value={main_text}></input>}
                {writing && <button type="submit" placeholder="Create a new Discussion" className="submit-button">Post Discussion</button>}

            </form>
               
        </div>
            )
        }

export default CreateDiscussion