import React, { useContext } from "react";
import { NavLink } from "react-router-dom";

import { AuthContext } from "../../context/auth-context";

import "./NavLinks.css";

const NavLinks = () => {
  const auth = useContext(AuthContext);

  return (
    <ul className="nav-links">
      <li>
        <NavLink to="/" exact >ALL USERS</NavLink>
      </li>
      { auth.isLoggedIn &&
        <React.Fragment>
          <li>
            <NavLink to={`/${auth.userID}/places`}>MY PLACES</NavLink>
          </li>
          <li>
            <NavLink to="/places/new">NEW PLACE</NavLink>
          </li>
          <li>
            <button onClick={auth.logout}>LOGOUT</button>
          </li>
        </React.Fragment>
      }
      { !auth.isLoggedIn &&
        <li>
          <NavLink to="/auth">AUTHENTICATE</NavLink>
        </li>
      }
    </ul>
  );
}

export default NavLinks;