import "./Loading.css";

const Loading = ({ text = "Loading..." }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>{text}</p>
    </div>
  );
};

export default Loading;