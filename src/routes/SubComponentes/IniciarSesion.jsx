import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./session.css";
import logo from "../../assets/Logo.svg";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import useAuthLogin from "../../hooks/useAuthLogin";

const IniciarSesion = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {loginUser, logout, checkToken, loading, error, role, username,user} = useAuthLogin();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const processingLogin = (e) =>{
    Swal.fire({
      title: 'Cargando...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); 
      },
    });
    handleSubmit(e)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser({ username: email, password });
      Swal.fire({
        icon: "success",
        title: "Bienvenido " + username,
        imageUrl: logo,
        imageWidth: 150,
        imageHeight: 150,
        imageAlt: "Logo",
      });
      setIsPopupVisible(false);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message, // Muestra el mensaje del error capturado
      });
    }
  };


  const getUserInitials = (name) => {
    return name?.split(" ").map((n) => n[0]).join("");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    window.location.reload()
  };

  return (
    <div className="container">
      {user ? (
        <div className="content-avatar">
          <div className="avatar">
            {getUserInitials(username)}
          </div>
          <Link to="/">
            <button onClick={handleLogout} className="bg-[#FFFFFF] text-black border border-black px-2 py-1 text-xs md:px-3 md:py-2 rounded-[50px] hover:bg-black hover:text-white hover:border-white transition duration-300 transform hover:scale-105 animate w-[6rem]">
              Cerrar sesión
            </button>
          </Link>
        </div>
      ) : (
        <div>
          <button
            className="button-header open-popup-button bg-[#FFFFFF] text-black border border-black px-2 py-1 text-xs md:px-3 md:py-2 rounded-[50px] hover:bg-black hover:text-white hover:border-white transition duration-300 transform hover:scale-105"
            onClick={() => setIsPopupVisible(true)}
          >
            Iniciar sesión
          </button>

          {isPopupVisible && (
            <div className="popup-overlay">
              <div className="popup-content">
                <button className="close-button" onClick={() => setIsPopupVisible(false)}>
                  <FontAwesomeIcon icon={faClose} />
                </button>
                <form className="form" onSubmit={processingLogin}>
                  <div className="logo-session">
                    <img src={logo} alt="Logo" />
                  </div>
                  <h2 className="title">Iniciar sesión</h2>
                  <input
                    className="input"
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="password-container">
                    <input
                      className="input"
                      placeholder="Contraseña"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      required
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="toggle-password" type="button" onClick={togglePasswordVisibility}>
                      {showPassword ? "👁️" : "🙈"}
                    </button>
                  </div>
                  {error && <div className="error-message">{error}</div>}
                  <button className="button" type="submit">
                    Iniciar sesión
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IniciarSesion;