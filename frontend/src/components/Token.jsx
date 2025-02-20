import React from "react";
import { Link } from "react-router-dom";

const Token = ({ logoUrl, name, ticker, description, address }) => {
  const baseUrl = "http://localhost:1337";

  return (
    <Link to={`/exchange/${address}`}>
      <div className="col-span-3 bg-slate-800/90 rounded-xl p-4 border border-slate-700 h-min hover:border-[#845DDE] transition-colors">
        <img src={`${baseUrl}${logoUrl}`} alt="Logo" />
        <div>
          <p>{name}</p>
          <p>{ticker}</p>
          <p>{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default Token;
