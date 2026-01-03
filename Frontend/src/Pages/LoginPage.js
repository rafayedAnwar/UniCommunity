import "../CSS/loginPage.css";
import Icon from "../Assets/icon.png";

const LoginPage = () => {
  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-form">
          <img src={Icon} alt="Icon" className="login-icon" />
          <h2>Login with G-Suite</h2>
          <p>If you don't have an account we will add one for you</p>
          <button className="google-login-btn" onClick={() =>(window.location.href = "http://localhost:1760/api/auth/google")}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google"/>
            Sign in with GSuite
          </button>

          <div className="divider">
            To maintain the relevance of our community and prevent lurkers,
            sign-up is only allowed using a BRACU email
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-content">
          <h1><span className="blue">Uni</span>Community</h1>
          <p>A community for BRAC University students</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
