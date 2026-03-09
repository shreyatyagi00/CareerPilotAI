import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./BackButton.scss";

const BackButton = ({ to = "/", onClick }) => {

  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleClick = () => {

    if (onClick) {
      onClick();
    } else {
      navigate(to);
    }

  };

  return (
    <button
      onClick={handleClick}
      className={`back-button ${show ? "show" : ""}`}
    >
      ←
    </button>
  );
};

export default BackButton;