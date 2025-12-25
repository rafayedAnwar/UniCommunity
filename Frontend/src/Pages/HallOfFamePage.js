import { useState, useEffect } from "react";

const HOF = () => {
    const [top, setTop] = useState([])
    useEffect(() => {
        fetch("http://localhost:1760/api/hof/getTop", {
            credentials: "include", // important for session-based auth
        })
        .then(res => res.json())
        .then(data => {
            if (data) setTop(data);
        })
        .catch(err => console.error(err));
    }, [])

    console.log(top)
    return (
        <div>
            <div>Hall Of Fame</div>
            <div></div>
        </div>
    )
}

export default HOF